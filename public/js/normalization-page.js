/* ==========================================================================
   NORMALIZATION PAGE
   Two phases per exercise:
     1. Funktionale Abhaengigkeiten bestimmen - the user builds their own FD
        guesses (click an attribute: 1st click -> LHS, 2nd -> RHS, 3rd ->
        cleared), checked via NormEngine.analyzeFdGuess against the exercise's
        real FDs. Equivalence, not exact string match - a differently grouped
        but logically equivalent FD set still passes (see the engine).
     2. Zerlegung - the existing schema-box decomposition editor, unlocked
        once phase 1 passes. Click an attribute in the pool, then click a
        table to add it there (an attribute can belong to multiple tables at
        once, since foreign/shared keys have to be duplicated). "Pruefen"
        runs the engine against the exercise's real FDs.
   ========================================================================== */

(function () {
  "use strict";

  const state = {
    currentIndex: 0,
    // phase 1: FD discovery
    userFds: [],          // [{lhs:[...], rhs:[...]}]
    fdAttrState: {},      // key -> "lhs" | "rhs" (state of the FD currently being built)
    fdsConfirmed: false,
    // phase 2: decomposition
    tables: [],            // [{id, name, attrs: Set<string>, pk: Set<string>}]
    selectedAttr: null,
    nextTableNum: 1
  };

  const els = {
    exIndex: document.getElementById("exIndex"),
    exText: document.getElementById("exText"),
    exDiff: document.getElementById("exDiff"),
    exHint: document.getElementById("exHint"),
    exHintBtn: document.getElementById("exHintBtn"),
    exSolutionBtn: document.getElementById("exSolutionBtn"),
    exPrev: document.getElementById("exPrev"),
    exNext: document.getElementById("exNext"),
    normProgress: document.getElementById("normProgress"),
    normSource: document.getElementById("normSource"),
    normTaskBody: document.getElementById("normTaskBody"),
    fdPhase: document.getElementById("fdPhase"),
    fdPool: document.getElementById("fdPool"),
    fdLhsPreview: document.getElementById("fdLhsPreview"),
    fdRhsPreview: document.getElementById("fdRhsPreview"),
    fdAddBtn: document.getElementById("fdAddBtn"),
    fdList: document.getElementById("fdList"),
    fdCheckBtn: document.getElementById("fdCheckBtn"),
    fdResetBtn: document.getElementById("fdResetBtn"),
    fdFeedback: document.getElementById("fdFeedback"),
    decomposePhase: document.getElementById("decomposePhase"),
    normPool: document.getElementById("normPool"),
    normTables: document.getElementById("normTables"),
    addTableBtn: document.getElementById("addTableBtn"),
    checkBtn: document.getElementById("checkBtn"),
    resetEditorBtn: document.getElementById("resetEditorBtn"),
    normFeedback: document.getElementById("normFeedback"),
    normSolutionReveal: document.getElementById("normSolutionReveal"),
    refNavLink: document.getElementById("refNavLink"),
    refPanelOverlay: document.getElementById("refPanelOverlay"),
    refPanelClose: document.getElementById("refPanelClose"),
    refPanelBody: document.getElementById("refPanelBody")
  };

  function currentExercise() {
    return NORMALIZATION_EXERCISES[state.currentIndex];
  }

  function currentPhase() {
    return state.fdsConfirmed ? "decompose" : "fds";
  }

  function attr(key) {
    return currentExercise().attributes.find(x => x.key === key);
  }
  function attrLabel(key) {
    const a = attr(key);
    return a ? a.label : key;
  }
  function fdText(fd) {
    return `${fd.lhs.map(attrLabel).join(", ")} &rarr; ${fd.rhs.map(attrLabel).join(", ")}`;
  }

  /* ------------------------------------------------------------ progress */
  function renderNormProgressBadge() {
    if (!els.normProgress) return;
    els.normProgress.textContent = `${SqlUeben.normSolvedCount()} / ${NORMALIZATION_EXERCISES.length} gelöst`;
  }

  /* ------------------------------------------------------------ full reset (exercise change) */
  function resetAllState() {
    state.userFds = [];
    state.fdAttrState = {};
    state.fdsConfirmed = false;
    els.fdFeedback.hidden = true;
    els.fdFeedback.innerHTML = "";
    els.decomposePhase.hidden = true;
    resetEditorState();
  }

  function resetEditorState() {
    state.tables = [];
    state.selectedAttr = null;
    state.nextTableNum = 1;
    els.normFeedback.hidden = true;
    els.normFeedback.innerHTML = "";
    els.normSolutionReveal.hidden = true;
    els.normSolutionReveal.innerHTML = "";
  }

  function makeTable(name) {
    return { id: "t" + (state.nextTableNum++), name, attrs: new Set(), pk: new Set() };
  }

  function tablesContaining(key) {
    return state.tables.filter(t => t.attrs.has(key));
  }

  /* ------------------------------------------------------------ rendering: given relation */
  function renderSource() {
    const ex = currentExercise();
    const rows = ex.attributes.map(a => `
      <div class="schema-row${ex.keyAttrs.includes(a.key) ? " is-pk" : ""}">
        <span class="schema-row-name">${a.label}</span>
        <span class="schema-row-type">${a.type}</span>
        <span class="schema-row-desc">${a.description}</span>
      </div>
    `).join("");

    els.normSource.innerHTML = `
      <div class="norm-schema-box">
        <div class="norm-schema-title">${ex.title}</div>
        <div class="schema-row schema-row-head">
          <span>Spalte</span><span>Typ</span><span>Beschreibung</span>
        </div>
        ${rows}
      </div>
    `;
  }

  /* ------------------------------------------------------------ phase 1: FD builder */
  function fdPoolAttrHtml(key) {
    const a = attr(key);
    const side = state.fdAttrState[key];
    const cls = side ? ` is-${side}` : "";
    const badge = side ? `<span class="fd-side-badge">${side === "lhs" ? "L" : "R"}</span>` : "";
    return `<button class="pool-attr${cls}" data-fd-attr="${key}">${a.label}${badge}</button>`;
  }

  function renderFdPool() {
    const ex = currentExercise();
    els.fdPool.innerHTML = ex.attributes.map(a => fdPoolAttrHtml(a.key)).join("");

    els.fdPool.querySelectorAll(".pool-attr").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.fdAttr;
        const cur = state.fdAttrState[key];
        if (!cur) state.fdAttrState[key] = "lhs";
        else if (cur === "lhs") state.fdAttrState[key] = "rhs";
        else delete state.fdAttrState[key];
        renderFdPool();
        renderFdPreview();
      });
    });
  }

  function renderFdPreview() {
    const lhsKeys = Object.keys(state.fdAttrState).filter(k => state.fdAttrState[k] === "lhs");
    const rhsKeys = Object.keys(state.fdAttrState).filter(k => state.fdAttrState[k] === "rhs");
    els.fdLhsPreview.innerHTML = lhsKeys.length
      ? lhsKeys.map(attrLabel).join(", ")
      : '<span class="fd-side-empty">-</span>';
    els.fdRhsPreview.innerHTML = rhsKeys.length
      ? rhsKeys.map(attrLabel).join(", ")
      : '<span class="fd-side-empty">-</span>';
    els.fdAddBtn.disabled = lhsKeys.length === 0 || rhsKeys.length === 0;
  }

  function renderFdList() {
    els.fdList.innerHTML = state.userFds.map((fd, i) => `
      <div class="fd-list-item">
        <span>${fdText(fd)}</span>
        <button class="schema-row-remove" data-remove-fd="${i}" title="Entfernen">&times;</button>
      </div>
    `).join("");

    els.fdList.querySelectorAll("[data-remove-fd]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.userFds.splice(Number(btn.dataset.removeFd), 1);
        renderFdList();
      });
    });
  }

  function addFd() {
    const lhs = Object.keys(state.fdAttrState).filter(k => state.fdAttrState[k] === "lhs");
    const rhs = Object.keys(state.fdAttrState).filter(k => state.fdAttrState[k] === "rhs");
    if (lhs.length === 0 || rhs.length === 0) return;
    state.userFds.push({ lhs, rhs });
    state.fdAttrState = {};
    renderFdPool();
    renderFdPreview();
    renderFdList();
  }

  function runFdCheck() {
    const ex = currentExercise();
    if (state.userFds.length === 0) {
      showFdFeedback(`<p class="check-banner err">Noch keine Abhängigkeit hinzugefügt.</p>`);
      return;
    }
    const result = NormEngine.analyzeFdGuess(state.userFds, ex.fds);
    let html = "";
    if (result.wrong.length > 0) {
      html += `<p class="check-banner err">Diese Abhängigkeiten lassen sich aus den echten Zusammenhängen nicht herleiten:</p>
        <ul class="norm-violations">${result.wrong.map(fd => `<li>${fdText(fd)}</li>`).join("")}</ul>`;
    }
    if (result.missingCount > 0) {
      html += `<p class="check-banner err">Es fehlen noch ${result.missingCount} Abhängigkeit${result.missingCount === 1 ? "" : "en"}, die sich aus den Attributen ableiten lassen müssten.</p>`;
    }
    if (result.correct) {
      html += `<p class="check-banner ok">✓ Richtig! Deine Abhängigkeiten entsprechen den echten Zusammenhängen. Weiter mit Schritt 2.</p>`;
      state.fdsConfirmed = true;
      els.decomposePhase.hidden = false;
      renderEditor();
      renderHintText();
    }
    showFdFeedback(html);
  }

  function showFdFeedback(html) {
    els.fdFeedback.innerHTML = html;
    els.fdFeedback.hidden = false;
  }

  function wireFdEvents() {
    els.fdAddBtn.addEventListener("click", addFd);
    els.fdCheckBtn.addEventListener("click", runFdCheck);
    els.fdResetBtn.addEventListener("click", () => {
      state.userFds = [];
      state.fdAttrState = {};
      els.fdFeedback.hidden = true;
      renderFdPool();
      renderFdPreview();
      renderFdList();
    });
  }

  /* ------------------------------------------------------------ phase 2: pool + editor tables */
  function poolAttrHtml(key) {
    const a = attr(key);
    const selected = state.selectedAttr === key ? " is-selected" : "";
    const count = tablesContaining(key).length;
    const badge = count > 0 ? `<span class="attr-chip-count" title="In ${count} Tabelle(n) verwendet">${count}</span>` : "";
    return `<button class="pool-attr${selected}" draggable="true" data-attr="${key}">${a.label} <span class="pool-attr-type">${a.type}</span>${badge}</button>`;
  }

  function schemaRowEditableHtml(key, table) {
    const a = attr(key);
    const isPk = table.pk.has(key);
    return `
      <div class="schema-row${isPk ? " is-pk" : ""}" data-attr="${key}">
        <span class="schema-row-name">${a.label}</span>
        <span class="schema-row-type">${a.type}</span>
        <label class="schema-row-pk">
          <input type="checkbox" data-toggle-pk="${key}" data-table="${table.id}" ${isPk ? "checked" : ""}> PK
        </label>
        <button class="schema-row-remove" data-remove-attr="${key}" data-table="${table.id}" title="Aus dieser Tabelle entfernen">&times;</button>
      </div>
    `;
  }

  function renderEditor() {
    const ex = currentExercise();

    els.normPool.innerHTML = ex.attributes.map(a => poolAttrHtml(a.key)).join("");

    els.normTables.innerHTML = state.tables.map(t => {
      const rows = [...t.attrs].map(k => schemaRowEditableHtml(k, t)).join("");
      return `
        <div class="norm-table-card">
          <div class="norm-table-header">
            <input type="text" class="norm-table-name" value="${t.name}" data-rename="${t.id}">
            <button class="norm-table-remove" data-remove-table="${t.id}" aria-label="Tabelle entfernen">&times;</button>
          </div>
          <div class="norm-table-body" data-drop-target="${t.id}">
            ${rows || '<span class="norm-empty-note">Attribut hierher ziehen oder im Pool anklicken, dann hier klicken</span>'}
          </div>
        </div>
      `;
    }).join("");

    wireEditorEvents();
  }

  /* ------------------------------------------------------------ click-to-assign */
  function addAttrToTable(key, tableId) {
    const table = state.tables.find(t => t.id === tableId);
    if (table) table.attrs.add(key);
    state.selectedAttr = null;
    renderEditor();
  }

  function wireEditorEvents() {
    document.querySelectorAll(".norm-editor .pool-attr").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.attr;
        state.selectedAttr = state.selectedAttr === key ? null : key;
        renderEditor();
      });
      btn.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", btn.dataset.attr);
        e.dataTransfer.effectAllowed = "copy";
      });
    });

    document.querySelectorAll("[data-drop-target]").forEach(zone => {
      zone.addEventListener("click", e => {
        if (e.target.closest("[data-toggle-pk]") || e.target.closest("[data-remove-attr]")) return;
        if (state.selectedAttr) addAttrToTable(state.selectedAttr, zone.dataset.dropTarget);
      });
      zone.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        zone.classList.add("is-dragover");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("is-dragover");
        const key = e.dataTransfer.getData("text/plain");
        if (key) addAttrToTable(key, zone.dataset.dropTarget);
      });
    });

    document.querySelectorAll("[data-toggle-pk]").forEach(input => {
      input.addEventListener("click", e => e.stopPropagation());
      input.addEventListener("change", e => {
        e.stopPropagation();
        const table = state.tables.find(t => t.id === input.dataset.table);
        const key = input.dataset.togglePk;
        if (table.pk.has(key)) table.pk.delete(key); else table.pk.add(key);
        renderEditor();
      });
    });

    document.querySelectorAll("[data-remove-attr]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const table = state.tables.find(t => t.id === btn.dataset.table);
        const key = btn.dataset.removeAttr;
        table.attrs.delete(key);
        table.pk.delete(key);
        renderEditor();
      });
    });

    document.querySelectorAll("[data-rename]").forEach(input => {
      input.addEventListener("input", () => {
        const table = state.tables.find(t => t.id === input.dataset.rename);
        if (table) table.name = input.value;
      });
      input.addEventListener("click", e => e.stopPropagation());
    });

    document.querySelectorAll("[data-remove-table]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.tables = state.tables.filter(t => t.id !== btn.dataset.removeTable);
        renderEditor();
      });
    });
  }

  function addTable() {
    state.tables.push(makeTable(`Tabelle ${state.nextTableNum}`));
    renderEditor();
  }

  /* ------------------------------------------------------------ checking */
  function runCheck() {
    const ex = currentExercise();
    const allAttrs = ex.attributes.map(a => a.key);
    const usedTables = state.tables.filter(t => t.attrs.size > 0);

    if (usedTables.length === 0) {
      showFeedback(`<p class="check-banner err">Noch keine Tabelle mit Attributen befüllt.</p>`);
      return;
    }

    const unassigned = allAttrs.filter(a => !usedTables.some(t => t.attrs.has(a)));
    const fragments = usedTables.map(t => [...t.attrs]);

    let html = "";

    if (unassigned.length > 0) {
      html += `<p class="check-banner err">Noch in keiner Tabelle: ${unassigned.map(attrLabel).join(", ")}</p>`;
    }
    const missingPk = usedTables.filter(t => t.pk.size === 0);
    if (missingPk.length > 0) {
      html += `<p class="check-banner err">Kein Primärschlüssel markiert für: ${missingPk.map(t => t.name).join(", ")} (PK-Checkbox an den Attributen anklicken).</p>`;
    }

    html += `<div class="norm-result-tables">`;
    usedTables.forEach((t, i) => {
      const frag = fragments[i];
      const analysis = NormEngine.analyzeNormalForm(frag, ex.fds);
      const declaredPk = [...t.pk];
      const pkIsValidKey = declaredPk.length > 0 && analysis.candidateKeys.some(
        k => k.length === declaredPk.length && k.every(a => declaredPk.includes(a))
      );
      html += `
        <div class="norm-result-card ${analysis.isBCNF ? "is-ok" : "is-warn"}">
          <div class="norm-result-title"><strong>${t.name}</strong> <span class="norm-result-badge">${analysis.level}</span></div>
          <p class="norm-result-attrs">${frag.map(attrLabel).join(", ")}</p>
          ${declaredPk.length
            ? `<p class="norm-result-note ${pkIsValidKey ? "ok" : "warn"}">${pkIsValidKey ? "✓" : "✗"} Primärschlüssel {${declaredPk.map(attrLabel).join(", ")}}${pkIsValidKey ? "" : " ist kein gültiger Schlüsselkandidat dieser Tabelle"}</p>`
            : ""}
          ${analysis.violations.length
            ? `<ul class="norm-violations">${analysis.violations.map(v => `<li>${v.type}-Verletzung: <em>${attrLabel(v.attr)}</em> hängt nur von {${v.det.map(attrLabel).join(", ")}} ab</li>`).join("")}</ul>`
            : ""}
        </div>
      `;
    });
    html += `</div>`;

    if (unassigned.length === 0 && missingPk.length === 0) {
      const lossless = NormEngine.isLosslessJoin(fragments, allAttrs, ex.fds);
      const depPreserving = NormEngine.isDependencyPreserving(fragments, ex.fds);
      const allBCNF = usedTables.every((t, i) => NormEngine.analyzeNormalForm(fragments[i], ex.fds).isBCNF);
      const allPkValid = usedTables.every((t, i) => {
        const declaredPk = [...t.pk];
        const analysis = NormEngine.analyzeNormalForm(fragments[i], ex.fds);
        return analysis.candidateKeys.some(k => k.length === declaredPk.length && k.every(a => declaredPk.includes(a)));
      });

      html += `<div class="norm-summary">`;
      html += `<p class="${lossless ? "ok" : "err"}">${lossless ? "✓" : "✗"} Verlustfrei</p>`;
      if (ex.requireDependencyPreserving) {
        html += `<p class="${depPreserving ? "ok" : "err"}">${depPreserving ? "✓" : "✗"} Abhängigkeitserhaltend</p>`;
      } else {
        html += `<p class="info">${depPreserving ? "✓ Abhängigkeitserhaltend" : "○ Nicht abhängigkeitserhaltend - das ist bei dieser Aufgabe zu erwarten, sieh dir die Musterlösung für die Erklärung an"}</p>`;
      }
      html += `<p class="${allBCNF ? "ok" : "warn"}">${allBCNF ? "✓" : "○"} Alle Tabellen in BCNF</p>`;

      const success = lossless && allBCNF && allPkValid && (ex.requireDependencyPreserving ? depPreserving : true);
      if (success) {
        html += `<p class="check-banner ok">✓ Richtig gelöst - alle Kriterien für diese Aufgabe sind erfüllt.</p>`;
        SqlUeben.markNormSolved(ex.id);
        renderNormProgressBadge();
      } else {
        html += `<p class="check-banner err">Noch nicht ganz - schau dir die Hinweise oben an.</p>`;
      }
      html += `</div>`;
    }

    showFeedback(html);
  }

  function showFeedback(html) {
    els.normFeedback.innerHTML = html;
    els.normFeedback.hidden = false;
  }

  /* ------------------------------------------------------------ exercise nav */
  function renderExercise() {
    const ex = currentExercise();
    els.exIndex.textContent = `Aufgabe ${state.currentIndex + 1} / ${NORMALIZATION_EXERCISES.length}`;
    els.exText.textContent = `${ex.title}: ${ex.intro}`;
    const diffLabel = { 1: "leicht", 2: "mittel", 3: "schwer" }[ex.level];
    els.exDiff.textContent = diffLabel;
    els.exDiff.className = `ex-diff diff-${ex.level}`;
    els.exHint.hidden = true;
    renderHintText();
    els.exPrev.disabled = state.currentIndex === 0;
    els.exNext.disabled = state.currentIndex === NORMALIZATION_EXERCISES.length - 1;
    els.normTaskBody.innerHTML = ex.task;
    renderSource();
    renderFdPool();
    renderFdPreview();
    renderFdList();
    renderEditor();
  }

  function renderHintText() {
    const ex = currentExercise();
    els.exHint.textContent = currentPhase() === "fds" ? ex.fdHint : `${ex.hint} ${ex.goal}`;
  }

  function showSolution() {
    const ex = currentExercise();
    if (currentPhase() === "fds") {
      state.userFds = ex.fds.map(fd => ({ lhs: [...fd.lhs], rhs: [...fd.rhs] }));
      state.fdAttrState = {};
      state.fdsConfirmed = true;
      renderFdPool();
      renderFdPreview();
      renderFdList();
      els.decomposePhase.hidden = false;
      renderEditor();
      renderHintText();
      showFdFeedback(`<p class="check-banner ok">Abhängigkeiten eingefügt - weiter mit Schritt 2.</p>`);
      return;
    }
    state.tables = ex.solution.tables.map(t => {
      const table = makeTable(t.name);
      t.attrs.forEach(a => table.attrs.add(a));
      table.pk = new Set(t.pk);
      return table;
    });
    renderEditor();
    els.normSolutionReveal.innerHTML = ex.solution.narrative;
    els.normSolutionReveal.hidden = false;
  }

  /* ------------------------------------------------------------ reference panel */
  let refPanelRendered = false;

  function openRefPanel() {
    if (!refPanelRendered) {
      els.refPanelBody.innerHTML = ReferenceView.renderNav(REFERENCE_NORMALISIERUNG) + ReferenceView.renderSections(REFERENCE_NORMALISIERUNG);
      SqlUeben.wireBackToTop(document.getElementById("refBackToTop"), els.refPanelOverlay.querySelector(".ref-panel"));
      refPanelRendered = true;
    }
    els.refPanelOverlay.classList.add("open");
    document.body.classList.add("ref-panel-locked");
  }

  function closeRefPanel() {
    els.refPanelOverlay.classList.remove("open");
    document.body.classList.remove("ref-panel-locked");
  }

  function wireStaticEvents() {
    els.exHintBtn.addEventListener("click", () => { els.exHint.hidden = !els.exHint.hidden; });
    els.exSolutionBtn.addEventListener("click", showSolution);
    els.exPrev.addEventListener("click", () => {
      if (state.currentIndex > 0) { state.currentIndex--; resetAllState(); renderExercise(); }
    });
    els.exNext.addEventListener("click", () => {
      if (state.currentIndex < NORMALIZATION_EXERCISES.length - 1) { state.currentIndex++; resetAllState(); renderExercise(); }
    });
    els.addTableBtn.addEventListener("click", addTable);
    els.checkBtn.addEventListener("click", runCheck);
    els.resetEditorBtn.addEventListener("click", () => { resetEditorState(); renderEditor(); });

    wireFdEvents();

    els.refNavLink.addEventListener("click", e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      openRefPanel();
    });
    els.refPanelClose.addEventListener("click", closeRefPanel);
    els.refPanelOverlay.addEventListener("click", e => {
      if (e.target === els.refPanelOverlay) closeRefPanel();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && els.refPanelOverlay.classList.contains("open")) closeRefPanel();
    });
  }

  function boot() {
    resetAllState();
    renderExercise();
    renderNormProgressBadge();
    SqlUeben.renderNavProgress();
    wireStaticEvents();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
