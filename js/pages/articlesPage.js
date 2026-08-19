/* =========================================================
   دوحة المداد — articlesPage.js
   6. قسم المقالات والدروس: المقالات التعليمية ومحرك البحث الحي
   ========================================================= */

import { store } from "../db/store.js";

function articleCard(a){
  const author = store.getUser(a.author);
  return `
    <div class="card card--hover">
      <div class="article-card__tag"><span class="badge-pill badge-pill--ember">${a.category}</span></div>
      <h3>${a.title}</h3>
      <p>${a.excerpt}</p>
      <div class="highlight-card__foot">
        <span>${author?.displayName || "كاتب"}</span>
        <span>${new Date(a.date).toLocaleDateString("ar")}</span>
      </div>
    </div>
  `;
}

function filterArticles(query, category){
  const q = query.trim().toLowerCase();
  return store.getArticles().filter(a => {
    const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    const matchesCategory = category === "الكل" || a.category === category;
    return matchesQuery && matchesCategory;
  });
}

export function renderArticlesPage(root){
  const categories = ["الكل", ...new Set(store.getArticles().map(a => a.category))];

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">تعلّم وتطوّر</span><h1>المقالات والدروس</h1></div>
        </div>

        <div class="article-search">
          <input type="text" id="article-search-input" placeholder="ابحث عن مقال، تقنية، أو موضوع...">
          <select id="article-category-select">
            ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>

        <div class="grid grid-3" id="articles-grid">
          ${store.getArticles().map(articleCard).join("")}
        </div>
        <div id="articles-empty"></div>
      </div>
    </section>
  `;

  const grid = root.querySelector("#articles-grid");
  const emptyBox = root.querySelector("#articles-empty");
  const input = root.querySelector("#article-search-input");
  const select = root.querySelector("#article-category-select");

  function update(){
    const results = filterArticles(input.value, select.value);
    grid.innerHTML = results.map(articleCard).join("");
    emptyBox.innerHTML = results.length ? "" : `<div class="empty-state"><div class="empty-state__icon">🔍</div><p>لا نتائج مطابقة لبحثك.</p></div>`;
  }

  input.addEventListener("input", update);
  select.addEventListener("change", update);
}
