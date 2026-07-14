/* ==========================================================================
   NORMALIZATION PAGE
   Interactive decomposition editor: drag (or click-to-assign) attributes into
   user-created tables, mark primary keys, then "Prüfen" runs the engine
   (normalization-engine.js) against the exercise's given FDs (normalization-data.js).

   Attributes can belong to MULTIPLE tables at once (foreign keys have to be
   duplicated to link fragments back together) - the attribute pool is a
   permanent palette, not a single-location bucket.
   ========================================================================== */

(function () {
  "use strict";

  const state = {
    currentIndex: 0,
    tables: [],       // [{id, name, attrs: Set<string>, pk: Set<string>}]
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
    normPool: document.getElementById("normPool"),
    normTables: document.getElementById("normTables"),
    addTableBtn: document.getElementById("addTableBtn"),
    checkBtn: document.getElementById("checkBtn"),
    resetEditorBtn: document.getElementById("resetEditorBtn"),
    normFeedback: document.getElementById("normFeedback"),
    normSolutionReveal: document.getElementById("normSolutionReveal")
  };

  function currentExercise() {
    return NORMALIZATION_EXERCISES[state.currentIndex];
  }

  function attrLabel(key) {
    const a = currentExercise().attributes.find(x => x.key === key);
    return a ? a.label : key;
  }

  /* ------------------------------------------------------------ progress */
  function renderNormProgressBadge() {
    if (!els.normProgress) return;
    els.normProgress.textContent = `${SqlUeben.normSolvedCount()} / ${NORMALIZATION_EXERCISES.length} gelöst`;
  }

  /* ------------------------------------------------------------ editor state */
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

  function tablesContaining(attr) {
    return state.tables.filter(t => t.attrs.has(attr));
  }

  /* ------------------------------------------------------------ rendering */
  function renderSource() {
    const ex = currentExercise();
    const fdText = ex.fds
      .map(fd => `${fd.lhs.map(attrLabel).join(", ")} &rarr; ${fd.rhs.map(attrLabel).join(", ")}`)
      .join("<br>");
    const headerRow = ex.attributes
      .map(a => `<th>${a.label}${ex.keyAttrs.includes(a.key) ? ' <span class="fk-mark">pk</span>' : ""}</th>`)
      .join("");
    const rows = ex.sampleRows
      .map(row => `<tr>${row.map(c => `<td>${c}</td>`).join("")}</tr>`)
      .join("");

    els.normSource.innerHTML = `
      <div class="norm-source-grid">
        <div class="norm-fds">
          <span class="editor-label">Funktionale Abhängigkeiten (gegeben)</span>
          <p class="norm-fd-list">${fdText}</p>
        </div>
        <div class="norm-sample-wrap">
          <span class="editor-label">Beispieldaten (0NF)</span>
          <div class="result-scroll">
            <table class="result-table"><thead><tr>${headerRow}</tr></thead><tbody>${rows}</tbody></table>
          </div>
        </div>
      </div>
    `;
  }

  function poolChipHtml(key) {
    const selected = state.selectedAttr === key ? " is-selected" : "";
    const count = tablesContaining(key).length;
    const badge = count > 0 ? `<span class="attr-chip-count" title="In ${count} Tabelle(n) verwendet">${count}</span>` : "";
    return `<div class="attr-chip${selected}" draggable="true" data-attr="${key}">${attrLabel(key)}${badge}</div>`;
  }

  function tableChipHtml(key, table) {
    const selected = state.selectedAttr === key ? " is-selected" : "";
    const pkBtn = `<button class="attr-pk-toggle" data-toggle-pk="${key}" data-table="${table.id}" title="Teil des Primärschlüssels?">${table.pk.has(key) ? "🔑" : "○"}</button>`;
    const removeBtn = `<button class="attr-chip-remove" data-remove-attr="${key}" data-table="${table.id}" title="Nur aus dieser Tabelle entfernen">&times;</button>`;
    return `<div class="attr-chip${selected}" draggable="true" data-attr="${key}" data-from-table="${table.id}">${pkBtn}${attrLabel(key)}${removeBtn}</div>`;
  }

  function renderEditor() {
    const ex = currentExercise();

    els.normPool.innerHTML = ex.attributes.map(a => poolChipHtml(a.key)).join("");
    els.normPool.dataset.dropTarget = "pool";

    els.normTables.innerHTML = state.tables.map(t => {
      const chips = [...t.attrs].map(k => tableChipHtml(k, t)).join("");
      return `
        <div class="norm-table-card">
          <div class="norm-table-header">
            <input type="text" class="norm-table-name" value="${t.name}" data-rename="${t.id}">
            <button class="norm-table-remove" data-remove-table="${t.id}" aria-label="Tabelle entfernen">&times;</button>
          </div>
          <div class="norm-table-body" data-drop-target="${t.id}">
            ${chips || '<span class="norm-empty-note">Attribute hierher ziehen oder klicken</span>'}
          </div>
        </div>
      `;
    }).join("");

    wireEditorEvents();
  }

  /* ------------------------------------------------------------ drag + click assignment */
  function addAttrToTable(key, tableId) {
    if (!key || tableId === "pool") { state.selectedAttr = null; renderEditor(); return; }
    const table = state.tables.find(t => t.id === tableId);
    if (table) table.attrs.add(key);
    state.selectedAttr = null;
    renderEditor();
  }

  function wireEditorEvents() {
    document.querySelectorAll(".attr-chip").forEach(chip => {
      chip.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", chip.dataset.attr);
      });
      chip.addEventListener("click", e => {
        if (e.target.closest("[data-toggle-pk]") || e.target.closest("[data-remove-attr]")) return;
        const key = chip.dataset.attr;
        state.selectedAttr = state.selectedAttr === key ? null : key;
        renderEditor();
      });
    });

    document.querySelectorAll("[data-drop-target]").forEach(zone => {
      zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("is-dragover"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("is-dragover");
        const key = e.dataTransfer.getData("text/plain");
        addAttrToTable(key, zone.dataset.dropTarget);
      });
      zone.addEventListener("click", e => {
        if (e.target.closest(".attr-chip")) return;
        if (state.selectedAttr) addAttrToTable(state.selectedAttr, zone.dataset.dropTarget);
      });
    });

    document.querySelectorAll("[data-toggle-pk]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const table = state.tables.find(t => t.id === btn.dataset.table);
        const key = btn.dataset.togglePk;
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
      html += `<p class="check-banner err">Kein Primärschlüssel markiert für: ${missingPk.map(t => t.name).join(", ")} (○-Symbol an den Attributen anklicken, um es zu 🔑 zu machen).</p>`;
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
    els.exHint.textContent = `${ex.hint} ${ex.goal}`;
    els.exPrev.disabled = state.currentIndex === 0;
    els.exNext.disabled = state.currentIndex === NORMALIZATION_EXERCISES.length - 1;
    renderSource();
    renderEditor();
  }

  function showSolution() {
    const ex = currentExercise();
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

  function wireStaticEvents() {
    els.exHintBtn.addEventListener("click", () => { els.exHint.hidden = !els.exHint.hidden; });
    els.exSolutionBtn.addEventListener("click", showSolution);
    els.exPrev.addEventListener("click", () => {
      if (state.currentIndex > 0) { state.currentIndex--; resetEditorState(); renderExercise(); }
    });
    els.exNext.addEventListener("click", () => {
      if (state.currentIndex < NORMALIZATION_EXERCISES.length - 1) { state.currentIndex++; resetEditorState(); renderExercise(); }
    });
    els.addTableBtn.addEventListener("click", addTable);
    els.checkBtn.addEventListener("click", runCheck);
    els.resetEditorBtn.addEventListener("click", () => { resetEditorState(); renderEditor(); });
  }

  function boot() {
    resetEditorState();
    renderExercise();
    renderNormProgressBadge();
    SqlUeben.renderNavProgress();
    wireStaticEvents();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
