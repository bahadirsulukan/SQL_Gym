/* ==========================================================================
   DATABASE PAGE
   Logic for a single database's practice page (e.g. datenbanken/nordwind.html).
   The page's <body data-db-id="..."> attribute determines which database
   and exercise set to load.
   ========================================================================== */

(function () {
  "use strict";

  const dbId = document.body.dataset.dbId;
  const def = DATABASES.find(d => d.id === dbId);
  const exercises = EXERCISES[dbId] || [];

  const state = { currentExIndex: 0 };
  let editor = null;

  const els = {
    schemaGrid: document.getElementById("schemaGrid"),
    exIndex: document.getElementById("exIndex"),
    exText: document.getElementById("exText"),
    exDiff: document.getElementById("exDiff"),
    exHint: document.getElementById("exHint"),
    exHintBtn: document.getElementById("exHintBtn"),
    exSolutionBtn: document.getElementById("exSolutionBtn"),
    exPrev: document.getElementById("exPrev"),
    exNext: document.getElementById("exNext"),
    sqlEditorMount: document.getElementById("sqlEditor"),
    runBtn: document.getElementById("runBtn"),
    clearBtn: document.getElementById("clearBtn"),
    resultArea: document.getElementById("resultArea"),
    resultMeta: document.getElementById("resultMeta"),
    checkBanner: document.getElementById("checkBanner"),
    refBtn: document.getElementById("refBtn"),
    refNavLink: document.getElementById("refNavLink"),
    refPanelOverlay: document.getElementById("refPanelOverlay"),
    refPanelClose: document.getElementById("refPanelClose"),
    refPanelBody: document.getElementById("refPanelBody")
  };

  /* ------------------------------------------------------------ schema */
  function renderSchema() {
    els.schemaGrid.innerHTML = Object.entries(def.schema).map(([table, cols]) => `
      <div class="schema-table">
        <h4>${table}</h4>
        <ul>
          ${cols.map(([name, type, key]) => `
            <li class="${(key || '').includes('pk') ? 'pk' : ''}">
              <span>${name}${key ? ` <span class="fk-mark">${key}</span>` : ""}</span>
              <span class="col-type">${type}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("");
  }

  /* ------------------------------------------------------------ exercises */
  function renderExercise() {
    const ex = exercises[state.currentExIndex];
    if (!ex) return;

    const solved = SqlUeben.isSolved(dbId, state.currentExIndex);
    els.exIndex.textContent = `Aufgabe ${state.currentExIndex + 1} / ${exercises.length}${solved ? "  ✓ gelöst" : ""}`;
    els.exText.textContent = ex.question;

    const diffLabel = { 1: "leicht", 2: "mittel", 3: "schwer" }[ex.difficulty];
    els.exDiff.textContent = diffLabel;
    els.exDiff.className = `ex-diff diff-${ex.difficulty}`;

    els.exHint.hidden = true;
    els.exHint.textContent = ex.hint;
    els.checkBanner.hidden = true;

    els.exPrev.disabled = state.currentExIndex === 0;
    els.exNext.disabled = state.currentExIndex === exercises.length - 1;
  }

  /* ------------------------------------------------------------ query execution */
  function renderResultPlaceholder() {
    els.resultArea.innerHTML = `<p class="result-placeholder">Noch keine Abfrage ausgeführt.</p>`;
    els.resultMeta.textContent = "";
  }

  function renderResultTable(result) {
    if (!result || result.length === 0) {
      els.resultArea.innerHTML = `<p class="result-placeholder">Query ausgeführt, keine Zeilen zurückgegeben.</p>`;
      els.resultMeta.textContent = "0 Zeilen";
      return;
    }
    const { columns, values } = result[0];
    const rows = values.map(row => `<tr>${row.map(cell => `<td>${SqlUeben.formatCell(cell)}</td>`).join("")}</tr>`).join("");
    els.resultArea.innerHTML = `
      <table class="result-table">
        <thead><tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    els.resultMeta.textContent = `${values.length} Zeile${values.length === 1 ? "" : "n"}`;
  }

  function showBanner(type, msg) {
    els.checkBanner.hidden = false;
    els.checkBanner.className = `check-banner ${type}`;
    els.checkBanner.textContent = msg;
  }

  function runUserQuery() {
    const sql = editor.getValue().trim();
    if (!sql) return;

    let result;
    try {
      result = SqlUeben.execQuery(dbId, sql);
    } catch (err) {
      els.resultArea.innerHTML = "";
      els.resultMeta.textContent = "";
      showBanner("err", `Fehler: ${err.message}`);
      return;
    }

    renderResultTable(result);

    const ex = exercises[state.currentExIndex];
    if (!ex) { els.checkBanner.hidden = true; return; }

    let expected;
    try {
      expected = SqlUeben.execQuery(dbId, ex.solution);
    } catch (err) {
      els.checkBanner.hidden = true;
      return;
    }

    const userRows = SqlUeben.normalizeRows(result);
    const expectedRows = SqlUeben.normalizeRows(expected);

    const matches = ex.check === "exact"
      ? SqlUeben.rowsMatchExact(userRows, expectedRows)
      : SqlUeben.rowsMatchAsSet(userRows, expectedRows);

    if (matches) {
      SqlUeben.markSolved(dbId, state.currentExIndex);
      SqlUeben.renderNavProgress();
      renderExercise();
      const hasExtraColumns = result.length && expected.length &&
        result[0].columns.length > expected[0].columns.length;
      showBanner("ok", hasExtraColumns
        ? "✓ Richtig, das Ergebnis stimmt (zusätzliche Spalten sind kein Problem)."
        : "✓ Richtig, das Ergebnis stimmt mit der Musterlösung überein.");
    } else if (ex.check === "exact" && SqlUeben.rowsMatchAsSet(userRows, expectedRows)) {
      showBanner("err", "✗ Fast! Die Werte stimmen, aber die Reihenfolge nicht. Prüfe dein ORDER BY.");
    } else {
      showBanner("err", "✗ Das Ergebnis stimmt noch nicht mit der Musterlösung überein. Versuch's weiter oder nutze den Hinweis.");
    }
  }

  /* ------------------------------------------------------------ reference panel */
  let refPanelRendered = false;

  function openRefPanel() {
    if (!refPanelRendered) {
      els.refPanelBody.innerHTML = ReferenceView.renderNav() + ReferenceView.renderSections();
      refPanelRendered = true;
    }
    els.refPanelOverlay.classList.add("open");
    document.body.classList.add("ref-panel-locked");
  }

  function closeRefPanel() {
    els.refPanelOverlay.classList.remove("open");
    document.body.classList.remove("ref-panel-locked");
  }

  /* ------------------------------------------------------------ wiring */
  function wireEvents() {
    els.runBtn.addEventListener("click", runUserQuery);
    els.clearBtn.addEventListener("click", () => {
      editor.setValue("");
      editor.focus();
      renderResultPlaceholder();
      els.checkBanner.hidden = true;
    });
    els.exHintBtn.addEventListener("click", () => { els.exHint.hidden = !els.exHint.hidden; });
    els.exSolutionBtn.addEventListener("click", () => {
      const ex = exercises[state.currentExIndex];
      if (!ex) return;
      editor.setValue(SqlUeben.formatSql(ex.solution));
      showBanner("info", "Lösung eingefügt, klicke „Ausführen“, um sie zu testen.");
    });
    els.exPrev.addEventListener("click", () => {
      if (state.currentExIndex > 0) { state.currentExIndex--; renderExercise(); els.checkBanner.hidden = true; }
    });
    els.exNext.addEventListener("click", () => {
      if (state.currentExIndex < exercises.length - 1) { state.currentExIndex++; renderExercise(); els.checkBanner.hidden = true; }
    });

    els.refBtn.addEventListener("click", openRefPanel);
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

  /* ------------------------------------------------------------ boot */
  function boot() {
    if (!def) {
      document.querySelector(".console-section .section-inner").innerHTML =
        `<p>Unbekannte Datenbank "${dbId}".</p>`;
      return;
    }
    editor = window.SqlEditor.createSqlEditor(els.sqlEditorMount, { onRun: runUserQuery });
    renderSchema();
    renderExercise();
    renderResultPlaceholder();
    wireEvents();
    SqlUeben.renderNavProgress();
    SqlUeben.bootSqlJsEngine().catch(err => {
      showBanner("err", "sql.js konnte nicht geladen werden. Prüfe deine Internetverbindung.");
      console.error(err);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
