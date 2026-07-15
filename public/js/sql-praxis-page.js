/* ==========================================================================
   SQL-PRAXIS PAGE
   DDL/DML/Trigger-Aufgaben laufen echt gegen eine frische sql.js-Instanz
   (nicht die zwischengespeicherte aus shared.js - Mutationen duerfen nicht
   zwischen Aufgaben durchsickern). Concept-Aufgaben (Stored Procedure/JDBC)
   sind Multiple-Choice ohne echte Ausfuehrung.
   ========================================================================== */

(function () {
  "use strict";

  const state = { currentIndex: 0, quizAnswered: false };
  let editor = null;

  const els = {
    exIndex: document.getElementById("exIndex"),
    exText: document.getElementById("exText"),
    exDiff: document.getElementById("exDiff"),
    exCategory: document.getElementById("exCategory"),
    exHint: document.getElementById("exHint"),
    exHintBtn: document.getElementById("exHintBtn"),
    exSolutionBtn: document.getElementById("exSolutionBtn"),
    exPrev: document.getElementById("exPrev"),
    exNext: document.getElementById("exNext"),
    praxisProgress: document.getElementById("praxisProgress"),
    praxisSchema: document.getElementById("praxisSchema"),
    praxisSchemaLabel: document.getElementById("praxisSchemaLabel"),
    praxisSchemaGrid: document.getElementById("praxisSchemaGrid"),
    sqlBlock: document.getElementById("praxisSqlBlock"),
    conceptBlock: document.getElementById("praxisConceptBlock"),
    sqlEditorMount: document.getElementById("sqlEditor"),
    runBtn: document.getElementById("runBtn"),
    clearBtn: document.getElementById("clearBtn"),
    resultArea: document.getElementById("resultArea"),
    resultMeta: document.getElementById("resultMeta"),
    checkBanner: document.getElementById("checkBanner"),
    quizOptions: document.getElementById("quizOptions"),
    quizFeedback: document.getElementById("quizFeedback")
  };

  function currentExercise() {
    return SQL_PRAXIS_EXERCISES[state.currentIndex];
  }

  /* ------------------------------------------------------------ progress */
  function renderProgressBadge() {
    els.praxisProgress.textContent = `${SqlUeben.praxisSolvedCount()} / ${SQL_PRAXIS_EXERCISES.length} gelöst`;
  }

  /* ------------------------------------------------------------ schema */
  function renderSchema(ex) {
    if (ex.category === "concept") {
      els.praxisSchema.hidden = true;
      return;
    }
    const def = DATABASES.find(d => d.id === ex.dbId);
    els.praxisSchemaLabel.textContent = `Schema: ${def.name}`;
    els.praxisSchemaGrid.innerHTML = Object.entries(def.schema).map(([table, cols]) => `
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
    els.praxisSchema.hidden = false;
  }

  /* ------------------------------------------------------------ exercise nav */
  const categoryLabel = { ddl: "DDL", dml: "DML", trigger: "Trigger", concept: "Stored Procedure / JDBC" };

  function renderExercise() {
    const ex = currentExercise();
    const solved = SqlUeben.isPraxisSolved(ex.id);
    els.exIndex.textContent = `Aufgabe ${state.currentIndex + 1} / ${SQL_PRAXIS_EXERCISES.length}${solved ? "  ✓ gelöst" : ""}`;
    els.exText.textContent = `${ex.title}: ${ex.question}`;
    els.exCategory.textContent = categoryLabel[ex.category];
    els.exCategory.className = `ex-diff cat-${ex.category}`;

    const diffLabel = { 1: "leicht", 2: "mittel", 3: "schwer" }[ex.level];
    els.exDiff.textContent = diffLabel;
    els.exDiff.className = `ex-diff diff-${ex.level}`;

    els.exHint.hidden = true;
    els.exHint.textContent = ex.hint;
    els.checkBanner.hidden = true;

    els.exPrev.disabled = state.currentIndex === 0;
    els.exNext.disabled = state.currentIndex === SQL_PRAXIS_EXERCISES.length - 1;

    state.quizAnswered = false;
    renderSchema(ex);

    if (ex.category === "concept") {
      els.sqlBlock.hidden = true;
      els.conceptBlock.hidden = false;
      renderQuiz(ex);
    } else {
      els.conceptBlock.hidden = true;
      els.sqlBlock.hidden = false;
      if (editor) editor.setValue("");
      renderResultPlaceholder();
    }
  }

  /* ------------------------------------------------------------ SQL execution */
  function renderResultPlaceholder() {
    els.resultArea.innerHTML = `<p class="result-placeholder">Noch keine Anweisung ausgeführt.</p>`;
    els.resultMeta.textContent = "";
  }

  function renderResultTable(result) {
    if (!result || result.length === 0) {
      els.resultArea.innerHTML = `<p class="result-placeholder">Ausgeführt, keine Zeilen zurückgegeben.</p>`;
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

  function runUserSql() {
    const ex = currentExercise();
    const sql = editor.getValue().trim();
    if (!sql) return;

    let db;
    try {
      db = SqlUeben.createFreshDbInstance(ex.dbId);
    } catch (err) {
      showBanner("err", `Fehler: ${err.message}`);
      return;
    }

    try {
      db.run(sql);
    } catch (err) {
      els.resultArea.innerHTML = "";
      els.resultMeta.textContent = "";
      showBanner("err", `Fehler: ${err.message}`);
      return;
    }

    if (ex.checkType === "throws" || ex.checkType === "succeeds") {
      let threw = false;
      try {
        db.run(ex.testSql);
      } catch (err) {
        threw = true;
      }
      const matches = ex.checkType === "throws" ? threw : !threw;

      if (ex.display) {
        try { renderResultTable(db.exec(ex.display)); } catch (err) { renderResultPlaceholder(); }
      }

      if (matches) {
        SqlUeben.markPraxisSolved(ex.id);
        renderProgressBadge();
        renderExercise();
        showBanner("ok", ex.testExplainOk || "✓ Richtig gelöst.");
      } else {
        showBanner("err", ex.testExplainFail || "✗ Noch nicht ganz richtig.");
      }
      return;
    }

    // checkType "select" (default)
    if (ex.postAction) {
      try { db.run(ex.postAction); } catch (err) {
        showBanner("err", `Fehler beim Testschritt: ${err.message}`);
        return;
      }
    }

    let result;
    try {
      result = db.exec(ex.verify);
    } catch (err) {
      showBanner("err", `Fehler bei der Prüfung: ${err.message}`);
      return;
    }
    renderResultTable(result);

    let expectedDb, expected;
    try {
      expectedDb = SqlUeben.createFreshDbInstance(ex.dbId);
      expectedDb.run(ex.solution);
      if (ex.postAction) expectedDb.run(ex.postAction);
      expected = expectedDb.exec(ex.verify);
    } catch (err) {
      // Musterlösung sollte nie fehlschlagen - falls doch, kein Nutzerfehler.
      return;
    }

    const userRows = SqlUeben.normalizeRows(result);
    const expectedRows = SqlUeben.normalizeRows(expected);

    if (SqlUeben.rowsMatchAsSet(userRows, expectedRows)) {
      SqlUeben.markPraxisSolved(ex.id);
      renderProgressBadge();
      renderExercise();
      showBanner("ok", "✓ Richtig, das Ergebnis stimmt mit der Musterlösung überein.");
    } else {
      showBanner("err", "✗ Das Ergebnis stimmt noch nicht. Versuch's weiter oder nutze den Hinweis.");
    }
  }

  /* ------------------------------------------------------------ concept quiz */
  function renderQuiz(ex) {
    els.quizFeedback.hidden = true;
    els.quizFeedback.innerHTML = "";
    els.quizOptions.innerHTML = ex.options.map((opt, i) => `
      <button class="quiz-option" data-idx="${i}">${opt}</button>
    `).join("");
    els.quizOptions.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => selectQuizOption(ex, Number(btn.dataset.idx)));
    });
  }

  function selectQuizOption(ex, idx) {
    const isCorrect = idx === ex.correctIndex;
    const buttons = els.quizOptions.querySelectorAll(".quiz-option");
    buttons.forEach((btn, i) => {
      btn.classList.remove("is-correct", "is-wrong");
      if (i === idx) btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
      if (isCorrect && i === ex.correctIndex) btn.classList.add("is-correct");
    });

    els.quizFeedback.hidden = false;
    els.quizFeedback.className = `quiz-feedback ${isCorrect ? "ok" : "err"}`;
    els.quizFeedback.innerHTML = `<p>${isCorrect ? "✓ Richtig!" : "✗ Nicht ganz."} ${ex.explanation}</p>`;

    if (isCorrect && !state.quizAnswered) {
      state.quizAnswered = true;
      SqlUeben.markPraxisSolved(ex.id);
      renderProgressBadge();
      const solved = els.exIndex.textContent.includes("gelöst");
      if (!solved) els.exIndex.textContent += "  ✓ gelöst";
    }
  }

  /* ------------------------------------------------------------ solution */
  function showSolution() {
    const ex = currentExercise();
    if (ex.category === "concept") {
      const buttons = els.quizOptions.querySelectorAll(".quiz-option");
      buttons.forEach((btn, i) => btn.classList.toggle("is-correct", i === ex.correctIndex));
      els.quizFeedback.hidden = false;
      els.quizFeedback.className = "quiz-feedback ok";
      els.quizFeedback.innerHTML = `<p>Richtige Antwort: ${ex.options[ex.correctIndex]}. ${ex.explanation}</p>`;
      return;
    }
    editor.setValue(ex.solution);
    showBanner("info", "Lösung eingefügt, klicke „Ausführen“, um sie zu testen.");
  }

  /* ------------------------------------------------------------ wiring */
  function wireEvents() {
    els.runBtn.addEventListener("click", runUserSql);
    els.clearBtn.addEventListener("click", () => {
      editor.setValue("");
      editor.focus();
      renderResultPlaceholder();
      els.checkBanner.hidden = true;
    });
    els.exHintBtn.addEventListener("click", () => { els.exHint.hidden = !els.exHint.hidden; });
    els.exSolutionBtn.addEventListener("click", showSolution);
    els.exPrev.addEventListener("click", () => {
      if (state.currentIndex > 0) { state.currentIndex--; renderExercise(); }
    });
    els.exNext.addEventListener("click", () => {
      if (state.currentIndex < SQL_PRAXIS_EXERCISES.length - 1) { state.currentIndex++; renderExercise(); }
    });
  }

  /* ------------------------------------------------------------ boot */
  function boot() {
    editor = window.SqlEditor.createSqlEditor(els.sqlEditorMount, { onRun: runUserSql });
    renderExercise();
    renderProgressBadge();
    SqlUeben.renderNavProgress();
    wireEvents();
    SqlUeben.bootSqlJsEngine().catch(err => {
      showBanner("err", "sql.js konnte nicht geladen werden. Prüfe deine Internetverbindung.");
      console.error(err);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
