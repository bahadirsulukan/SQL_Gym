/* ==========================================================================
   SHARED
   Utilities used by every page: sql.js bootstrap, query execution helpers,
   result formatting, and progress tracking (localStorage).
   Loaded before home.js / db-page.js on every page.
   ========================================================================== */

const SqlUeben = (function () {
  "use strict";

  let SQL = null;
  const dbInstances = {};

  function bootSqlJsEngine() {
    if (SQL) return Promise.resolve(SQL);
    return window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    }).then(instance => { SQL = instance; return SQL; });
  }

  function getDbInstance(dbId) {
    if (dbInstances[dbId]) return dbInstances[dbId];
    const def = DATABASES.find(d => d.id === dbId);
    if (!def) throw new Error(`Unbekannte Datenbank: ${dbId}`);
    const db = new SQL.Database();
    db.run(def.sql);
    dbInstances[dbId] = db;
    return db;
  }

  function execQuery(dbId, sql) {
    const db = getDbInstance(dbId);
    return db.exec(sql); // [{columns:[...], values:[[...],...]}] or []
  }

  function formatCell(cell) {
    if (cell === null) return `<span class="cell-null">NULL</span>`;
    if (typeof cell === "number" && !Number.isInteger(cell)) return cell.toFixed(2);
    return String(cell);
  }

  function normalizeRows(result) {
    if (!result || result.length === 0) return [];
    return result[0].values.map(row => {
      const normalized = row.map(v => (v === null ? null : (typeof v === "number" ? Math.round(v * 1000) / 1000 : v)));
      // Spaltenreihenfolge ist fuer die Korrektheit egal (SELECT Vorname, Nachname
      // ist genauso richtig wie SELECT Nachname, Vorname) - deshalb pro Zeile sortiert
      // als Werte-Array zurueckgeben statt auf exakte Spaltenposition zu bestehen.
      return normalized.map(v => JSON.stringify(v)).sort();
    });
  }

  // Prueft, ob alle erwarteten Werte in der Nutzerzeile vorkommen (als Multiset,
  // Duplikate zaehlen). Erlaubt zusaetzliche, ueberschuessige Spalten in der
  // Nutzerabfrage - wer mehr ausgibt als noetig, soll nicht als falsch gelten.
  function rowContainsAll(userRow, expectedRow) {
    const remaining = [...userRow];
    for (const val of expectedRow) {
      const idx = remaining.indexOf(val);
      if (idx === -1) return false;
      remaining.splice(idx, 1);
    }
    return true;
  }

  function rowsMatchExact(userRows, expectedRows) {
    return userRows.length === expectedRows.length &&
      userRows.every((row, i) => rowContainsAll(row, expectedRows[i]));
  }

  function rowsMatchAsSet(userRows, expectedRows) {
    if (userRows.length !== expectedRows.length) return false;
    const remaining = [...userRows];
    return expectedRows.every(expected => {
      const idx = remaining.findIndex(row => rowContainsAll(row, expected));
      if (idx === -1) return false;
      remaining.splice(idx, 1);
      return true;
    });
  }

  /* ---------------------------------------------------------------- sql formatting */
  function formatSql(sql) {
    const keywords = [
      "SELECT DISTINCT", "SELECT", "FROM", "LEFT JOIN", "JOIN",
      "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT"
    ];
    let out = " " + sql.trim().replace(/\s+/g, " ");
    keywords.forEach(kw => {
      const re = kw === "JOIN" ? /(?<!LEFT)\sJOIN\s/g : new RegExp(`\\s${kw}\\s`, "g");
      out = out.replace(re, `\n${kw} `);
    });
    return out.trim();
  }

  /* ---------------------------------------------------------------- progress */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem("sqluebenProgress") || "{}"); }
    catch (e) { return {}; }
  }
  function saveProgress(progress) {
    localStorage.setItem("sqluebenProgress", JSON.stringify(progress));
  }
  function markSolved(dbId, exIdx) {
    const progress = loadProgress();
    progress[dbId] = progress[dbId] || {};
    progress[dbId][exIdx] = true;
    saveProgress(progress);
  }
  function isSolved(dbId, exIdx) {
    const progress = loadProgress();
    return !!(progress[dbId] && progress[dbId][exIdx]);
  }
  function solvedCount(dbId) {
    const progress = loadProgress();
    return Object.keys(progress[dbId] || {}).length;
  }
  function totalCount() {
    return DATABASES.reduce((sum, db) => sum + (EXERCISES[db.id] || []).length, 0);
  }
  function totalSolved() {
    return DATABASES.reduce((sum, db) => sum + solvedCount(db.id), 0);
  }
  function resetProgress() {
    localStorage.removeItem("sqluebenProgress");
  }

  /* ---------------------------------------------------------------- nav badge */
  function renderNavProgress() {
    const el = document.getElementById("navProgress");
    if (!el) return;
    el.textContent = `${totalSolved()} / ${totalCount()} gelöst`;

    // Klick auf das Badge setzt den gesamten Fortschritt zurueck (mit Rueckfrage).
    // dataset-Flag verhindert doppeltes Binden, falls renderNavProgress mehrfach laeuft.
    if (!el.dataset.resetWired) {
      el.dataset.resetWired = "true";
      el.title = "Klicken, um deinen gesamten Fortschritt zurückzusetzen";
      el.addEventListener("click", () => {
        const sure = window.confirm(
          "Wirklich deinen gesamten Fortschritt (alle Datenbanken) zurücksetzen? Das kann nicht rückgängig gemacht werden."
        );
        if (sure) {
          resetProgress();
          window.location.reload();
        }
      });
    }
  }

  /* ---------------------------------------------------------------- back-to-top */
  // scrollEl: das scrollende Element (z.B. das Referenz-Panel). Weggelassen -> window/Seite.
  function wireBackToTop(button, scrollEl) {
    if (!button) return;
    const target = scrollEl || window;
    const getScrollTop = () => (target === window ? window.scrollY : target.scrollTop);
    const onScroll = () => button.classList.toggle("is-visible", getScrollTop() > 400);
    target.addEventListener("scroll", onScroll);
    button.addEventListener("click", () => target.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }

  return {
    bootSqlJsEngine, execQuery, formatCell, normalizeRows, formatSql,
    rowsMatchExact, rowsMatchAsSet,
    loadProgress, saveProgress, markSolved, isSolved, solvedCount, totalCount, totalSolved,
    resetProgress, renderNavProgress, wireBackToTop
  };
})();
