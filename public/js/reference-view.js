/* ==========================================================================
   REFERENCE VIEW
   Renders REFERENCE (reference-data.js) into HTML: the jump-nav pills and
   the category/card grid. Shared by referenz.html (full page) and the
   in-page reference panel on every database page (db-page.js).
   ========================================================================== */

const ReferenceView = (function () {
  "use strict";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderNav(data) {
    return `
      <nav class="ref-nav" aria-label="Sprungmarken">
        ${data.map(cat => `<a href="#${cat.id}">${cat.title.replace(/&amp;/g, "&")}</a>`).join("")}
      </nav>
    `;
  }

  function renderCard(card) {
    const order = card.order
      ? `<ol class="ref-order">${card.order.map(step => `<li>${step}</li>`).join("")}</ol>`
      : "";
    const code = card.code
      ? `<pre><code>${escapeHtml(card.code)}</code></pre>`
      : "";
    const note = card.note ? `<p class="ref-note">${card.note}</p>` : "";
    return `
      <div class="ref-card">
        <h3>${card.title}</h3>
        ${order}
        ${code}
        ${note}
      </div>
    `;
  }

  function renderSections(data) {
    return data.map(cat => `
      <div class="ref-category" id="${cat.id}">
        <h2 class="ref-cat-title"><span class="section-num">${cat.num}</span> ${cat.title}</h2>
        <div class="ref-grid">
          ${cat.cards.map(renderCard).join("")}
        </div>
      </div>
    `).join("");
  }

  return { renderNav, renderSections };
})();
