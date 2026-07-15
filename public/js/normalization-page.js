/* ==========================================================================
   NORMALIZATION PAGE
   Given relation is shown as an exam-style schema box (column, type,
   description, PK marked) - click an attribute in the pool, then click a
   table to add it there (an attribute can belong to multiple tables at
   once, since foreign/shared keys have to be duplicated to link fragments
   back together). "Prüfen" runs the engine (normalization-engine.js)
   against the exercise's given FDs (normalization-data.js).
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
    normTaskBody: document.getElementById("normTaskBody"),
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

  function attr(key) {
    return currentExercise().attributes.find(x => x.key === key);
  }
  function attrLabel(key) {
    const a = attr(key);
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

  function tablesContaining(key) {
    return state.tables.filter(t => t.attrs.has(key));
  }

  /* ------------------------------------------------------------ rendering: given relation */
  function renderSource() {
    const ex = currentExercise();
    const fdText = ex.fds
      .map(fd => `${fd.lhs.map(attrLabel).join(", ")} &rarr; ${fd.rhs.map(attrLabel).join(", ")}`)
      .join("<br>");
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
      <div class="norm-fds">
        <span class="editor-label">Gegebene funktionale Abhängigkeiten</span>
        <p class="norm-fd-list">${fdText}</p>
      </div>
    `;
  }

  /* ------------------------------------------------------------ rendering: pool + editor tables */
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
    document.querySelectorAll(".pool-attr").forEach(btn => {
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
    els.exHint.textContent = `${ex.hint} ${ex.goal}`;
    els.exPrev.disabled = state.currentIndex === 0;
    els.exNext.disabled = state.currentIndex === NORMALIZATION_EXERCISES.length - 1;
    els.normTaskBody.innerHTML = ex.task;
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
      if (state.currentIndex > 0) { state.currentIndex--; resetEditorState(); renderExercise(); }
    });
    els.exNext.addEventListener("click", () => {
      if (state.currentIndex < NORMALIZATION_EXERCISES.length - 1) { state.currentIndex++; resetEditorState(); renderExercise(); }
    });
    els.addTableBtn.addEventListener("click", addTable);
    els.checkBtn.addEventListener("click", runCheck);
    els.resetEditorBtn.addEventListener("click", () => { resetEditorState(); renderEditor(); });

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
    resetEditorState();
    renderExercise();
    renderNormProgressBadge();
    SqlUeben.renderNavProgress();
    wireStaticEvents();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
