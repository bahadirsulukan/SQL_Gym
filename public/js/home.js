/* ==========================================================================
   HOME PAGE
   Draws the hero ERD animation and updates the nav progress badge.
   The database picker grid lives on its own page (datenbanken.html).
   ========================================================================== */

(function () {
  "use strict";

  function drawHeroErd() {
    const svg = document.getElementById("erdSvg");
    if (!svg) return;
    const nodes = [
      { x: 210, y: 40,  label: "Kunde" },
      { x: 60,  y: 150, label: "Bestellung" },
      { x: 360, y: 150, label: "Artikel" },
      { x: 130, y: 280, label: "Personal" },
      { x: 290, y: 280, label: "Kategorie" }
    ];
    const edges = [[0,1],[0,2],[1,2],[1,3],[2,4]];
    const ns = "http://www.w3.org/2000/svg";

    edges.forEach(([a, b], i) => {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", nodes[a].x);
      line.setAttribute("y1", nodes[a].y);
      line.setAttribute("x2", nodes[b].x);
      line.setAttribute("y2", nodes[b].y);
      line.setAttribute("stroke", "#2b3444");
      line.setAttribute("stroke-width", "1.4");
      svg.appendChild(line);

      const pulse = document.createElementNS(ns, "circle");
      pulse.setAttribute("r", "3");
      pulse.setAttribute("fill", "#d9a441");
      const anim = document.createElementNS(ns, "animateMotion");
      anim.setAttribute("dur", `${3 + i * 0.6}s`);
      anim.setAttribute("repeatCount", "indefinite");
      anim.setAttribute("path", `M${nodes[a].x},${nodes[a].y} L${nodes[b].x},${nodes[b].y}`);
      pulse.appendChild(anim);
      svg.appendChild(pulse);
    });

    nodes.forEach(n => {
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", n.x - 34);
      rect.setAttribute("y", n.y - 14);
      rect.setAttribute("width", 68);
      rect.setAttribute("height", 28);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", "#171d27");
      rect.setAttribute("stroke", "#d9a441");
      rect.setAttribute("stroke-width", "1.2");
      svg.appendChild(rect);

      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", n.x);
      text.setAttribute("y", n.y + 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10.5");
      text.setAttribute("font-family", "JetBrains Mono, monospace");
      text.setAttribute("fill", "#e9ebee");
      text.textContent = n.label;
      svg.appendChild(text);
    });
  }

  function renderStats() {
    const dbCountEl = document.getElementById("statDbCount");
    const exCountEl = document.getElementById("statExCount");
    const levelCountEl = document.getElementById("statLevelCount");
    if (!dbCountEl) return;
    dbCountEl.textContent = DATABASES.length;
    exCountEl.textContent = SqlUeben.totalCount();
    levelCountEl.textContent = new Set(DATABASES.map(db => db.level)).size;
  }

  document.addEventListener("DOMContentLoaded", () => {
    SqlUeben.renderNavProgress();
    drawHeroErd();
    renderStats();
  });
})();
