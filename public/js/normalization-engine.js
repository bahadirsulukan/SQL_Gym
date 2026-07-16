/* ==========================================================================
   NORMALIZATION ENGINE
   Pure relational-theory functions for the interactive decomposition editor:
   attribute closure, candidate keys, 2NF/3NF/BCNF analysis per fragment,
   lossless-join check (chase algorithm) and dependency-preservation check.
   No DOM dependency - used by normalization-page.js.
   ========================================================================== */

const NormEngine = (function () {
  "use strict";

  function closure(attrs, fds) {
    const result = new Set(attrs);
    let changed = true;
    while (changed) {
      changed = false;
      for (const fd of fds) {
        if (fd.lhs.every(a => result.has(a))) {
          for (const b of fd.rhs) {
            if (!result.has(b)) { result.add(b); changed = true; }
          }
        }
      }
    }
    return result;
  }

  function isSuperkeyOfSet(attrs, targetAttrs, fds) {
    const cl = closure(attrs, fds);
    return targetAttrs.every(a => cl.has(a));
  }

  function allSubsets(arr) {
    const n = arr.length;
    const subsets = [];
    for (let mask = 1; mask < (1 << n); mask++) {
      subsets.push(arr.filter((_, i) => mask & (1 << i)));
    }
    subsets.sort((a, b) => a.length - b.length);
    return subsets;
  }

  function minimalSuperkeys(attrs, fds, targetAttrs) {
    const target = targetAttrs || attrs;
    const found = [];
    for (const s of allSubsets(attrs)) {
      if (!isSuperkeyOfSet(s, target, fds)) continue;
      const isSupersetOfExisting = found.some(k => k.every(a => s.includes(a)));
      if (!isSupersetOfExisting) found.push(s);
    }
    return found;
  }

  function candidateKeys(allAttrs, fds) {
    return minimalSuperkeys(allAttrs, fds, allAttrs);
  }

  function primeAttributes(allAttrs, fds) {
    const keys = candidateKeys(allAttrs, fds);
    const prime = new Set();
    keys.forEach(k => k.forEach(a => prime.add(a)));
    return prime;
  }

  function minimalDeterminants(target, candidates, fds) {
    const found = [];
    for (const s of allSubsets(candidates)) {
      if (!closure(s, fds).has(target)) continue;
      const isSupersetOfExisting = found.some(d => d.every(a => s.includes(a)));
      if (!isSupersetOfExisting) found.push(s);
    }
    return found;
  }

  function analyzeNormalForm(fragmentAttrs, fds) {
    const fragKeys = candidateKeys(fragmentAttrs, fds);
    const prime = new Set();
    fragKeys.forEach(k => k.forEach(a => prime.add(a)));

    const violations = [];
    let is2NF = true, is3NF = true, isBCNF = true;

    for (const A of fragmentAttrs) {
      const others = fragmentAttrs.filter(a => a !== A);
      const dets = minimalDeterminants(A, others, fds);
      for (const X of dets) {
        const xIsSuperkeyOfFragment = fragmentAttrs.every(a => closure(X, fds).has(a));
        if (xIsSuperkeyOfFragment) continue; // full dependency on a (super)key - always fine

        const isPrimeAttr = prime.has(A);
        const xIsProperSubsetOfSomeKey = fragKeys.some(k => X.length < k.length && X.every(a => k.includes(a)));

        if (!isPrimeAttr && xIsProperSubsetOfSomeKey) {
          is2NF = false; is3NF = false; isBCNF = false;
          violations.push({ type: "2NF", det: X, attr: A });
        } else if (!isPrimeAttr) {
          is3NF = false; isBCNF = false;
          violations.push({ type: "3NF", det: X, attr: A });
        } else {
          isBCNF = false;
          violations.push({ type: "BCNF", det: X, attr: A });
        }
      }
    }

    let level = "BCNF";
    if (!isBCNF) level = is3NF ? "3NF" : (is2NF ? "2NF" : "1NF");
    return { level, is2NF, is3NF, isBCNF, violations, candidateKeys: fragKeys };
  }

  function isLosslessJoin(fragments, allAttrs, fds) {
    const nRows = fragments.length;
    const nCols = allAttrs.length;
    const parent = {};
    function find(x) {
      if (!(x in parent)) parent[x] = x;
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    }
    function union(x, y) {
      const rx = find(x), ry = find(y);
      if (rx !== ry) parent[rx] = ry;
    }

    const tableau = [];
    for (let i = 0; i < nRows; i++) {
      const row = [];
      for (let j = 0; j < nCols; j++) {
        const attr = allAttrs[j];
        row.push(fragments[i].includes(attr) ? ("a_" + j) : ("b_" + i + "_" + j));
      }
      tableau.push(row);
    }
    const colIndex = attr => allAttrs.indexOf(attr);

    let changed = true, iterations = 0;
    while (changed && iterations < 1000) {
      changed = false; iterations++;
      for (const fd of fds) {
        const lhsCols = fd.lhs.map(colIndex);
        const rhsCols = fd.rhs.map(colIndex);
        for (let i = 0; i < nRows; i++) {
          for (let k = i + 1; k < nRows; k++) {
            const agree = lhsCols.every(c => find(tableau[i][c]) === find(tableau[k][c]));
            if (!agree) continue;
            for (const c of rhsCols) {
              const si = tableau[i][c], sk = tableau[k][c];
              if (find(si) === find(sk)) continue;
              const iIsA = si.startsWith("a_"), kIsA = sk.startsWith("a_");
              if (iIsA && !kIsA) union(sk, si);
              else if (kIsA && !iIsA) union(si, sk);
              else union(si, sk);
              changed = true;
            }
          }
        }
      }
    }

    for (let i = 0; i < nRows; i++) {
      let allA = true;
      for (let j = 0; j < nCols; j++) {
        if (find(tableau[i][j]) !== find("a_" + j)) { allA = false; break; }
      }
      if (allA) return true;
    }
    return false;
  }

  function isDependencyPreserving(fragments, fds) {
    return fds.every(fd => {
      let result = new Set(fd.lhs);
      let changed = true;
      while (changed) {
        changed = false;
        for (const frag of fragments) {
          const inter = frag.filter(a => result.has(a));
          const cl = closure(inter, fds);
          for (const a of frag) {
            if (cl.has(a) && !result.has(a)) { result.add(a); changed = true; }
          }
        }
      }
      return fd.rhs.every(a => result.has(a));
    });
  }

  // Ist fd durch fds herleitbar? (Y ⊆ X+ unter fds)
  function fdImpliedBy(fd, fds) {
    if (fd.lhs.length === 0 || fd.rhs.length === 0) return false;
    const cl = closure(fd.lhs, fds);
    return fd.rhs.every(a => cl.has(a));
  }

  // Zwei FD-Mengen sind aequivalent, wenn jede die andere vollstaendig herleiten
  // kann (F1 |= F2 und F2 |= F1) - so bleibt eine andere, aber gleichwertige
  // Gruppierung/Aufteilung der Abhaengigkeiten trotzdem "richtig".
  function analyzeFdGuess(userFds, trueFds) {
    const missing = trueFds.filter(fd => !fdImpliedBy(fd, userFds));
    const wrong = userFds.filter(fd => !fdImpliedBy(fd, trueFds));
    return { correct: missing.length === 0 && wrong.length === 0, missingCount: missing.length, wrong };
  }

  return {
    closure, candidateKeys, primeAttributes, analyzeNormalForm,
    isLosslessJoin, isDependencyPreserving, minimalDeterminants,
    fdImpliedBy, analyzeFdGuess
  };
})();
