/* ==========================================================================
   DATENBANKEN PAGE
   Renders the full database picker grid (with difficulty level per card)
   on its own page, separate from the homepage.
   ========================================================================== */

(function () {
  "use strict";

  const LEVEL_LABEL = { 1: "leicht", 2: "mittel", 3: "schwer" };

  function renderDbGrid() {
    const grid = document.getElementById("dbGrid");
    if (!grid) return;

    grid.innerHTML = DATABASES.map(db => {
      const total = (EXERCISES[db.id] || []).length;
      const solved = SqlUeben.solvedCount(db.id);
      const pct = total ? Math.round((solved / total) * 100) : 0;
      return `
        <a class="db-card" href="/datenbanken/${db.id}.html">
          <div class="db-card-head">
            <span class="db-icon">${db.icon}</span>
            <span class="ex-diff diff-${db.level}">${LEVEL_LABEL[db.level]}</span>
          </div>
          <h3>${db.name}</h3>
          <p>${db.description}</p>
          <div class="db-tags">${db.tags.map(t => `<span class="db-tag">${t}</span>`).join("")}</div>
          <div class="db-progress"><div class="db-progress-fill" style="width:${pct}%"></div></div>
          <span class="db-progress-label">${solved} / ${total} gelöst</span>
        </a>
      `;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderDbGrid();
    SqlUeben.renderNavProgress();
  });
})();
