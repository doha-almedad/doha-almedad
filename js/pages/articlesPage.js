/* =========================================================
   دوحة المداد — articlesPage.js
   6. قسم المقالات والدروس: المقالات التعليمية ومحرك البحث الحي
   ========================================================= */

import { store } from "../db/store.js";
import { openModal, showToast } from "../components/modals.js";
import { icon } from "../components/icons.js";

function openArticleModal(a){
  const author = store.getUser(a.author);
  openModal(`
    <div class="modal-box__head"><h3>${a.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="highlight-card__meta" style="margin-bottom:12px;">
      <span class="badge-pill badge-pill--ember">${a.category}</span>
      <span class="badge-pill">${author?.displayName || "كاتب"}</span>
      <span class="badge-pill">${new Date(a.date).toLocaleDateString("ar")}</span>
    </div>
    ${a.image ? `<img src="${a.image}" alt="" class="feed-item__image">` : ""}
    <p style="white-space:pre-line;">${a.content}</p>
  `, { size: "lg" });
}

function articleCard(a){
  const author = store.getUser(a.author);
  return `
    <div class="card card--hover" data-article-id="${a.id}" role="button" tabindex="0">
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

function bindArticleClicks(container){
  container.querySelectorAll("[data-article-id]").forEach(card => {
    const open = () => {
      const article = store.getArticles().find(a => a.id === card.getAttribute("data-article-id"));
      if(article) openArticleModal(article);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); } });
  });
}

export function renderArticlesPage(root){
  const user = store.getCurrentUser();
  const categories = ["الكل", ...new Set(store.getArticles().map(a => a.category))];
  let pendingImage = null;

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">تعلّم وتطوّر</span><h1>${icon("document", { size: 26, cls: "heading-icon" })} المقالات والدروس</h1></div>
        </div>

        <div class="card composer" style="margin-bottom:30px;">
          <h3 style="margin-bottom:6px;">اكتب مقالاً جديداً</h3>
          <p class="text-muted" style="font-size:.82rem;margin-bottom:14px;">سيراجع فريق الإشراف مقالك قبل نشره في هذه الصفحة.</p>
          <div class="composer__meta">
            <div class="field">
              <label>عنوان المقال</label>
              <input type="text" id="article-title" placeholder="عنوان المقال">
            </div>
            <div class="field" style="max-width:200px;">
              <label>التصنيف</label>
              <input type="text" id="article-category" placeholder="مثال: تقنيات الكتابة">
            </div>
          </div>
          <div class="field">
            <label>محتوى المقال</label>
            <textarea id="article-content" placeholder="اكتب مقالك هنا..."></textarea>
          </div>
          <div class="field">
            <label>صورة توضيحية (اختياري)</label>
            <label class="image-upload" id="image-upload-label">
              <span id="image-upload-preview">${icon("image", { size: 22 })}<span>أضف صورة توضيحية للمقال</span></span>
              <input type="file" id="article-image" accept="image/*" hidden>
            </label>
          </div>
          <button class="btn btn-primary" id="submit-article-btn">${icon("send", { size: 16 })}<span>إرسال للمراجعة</span></button>
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
    emptyBox.innerHTML = results.length ? "" : `<div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لا نتائج مطابقة لبحثك.</p></div>`;
    bindArticleClicks(grid);
  }

  bindArticleClicks(grid);
  input.addEventListener("input", update);
  select.addEventListener("change", update);

  root.querySelector("#article-image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImage = reader.result;
      root.querySelector("#image-upload-preview").innerHTML = `<img src="${pendingImage}" alt="" class="image-upload__thumb"><span>تم اختيار الصورة — انقر للتغيير</span>`;
    };
    reader.readAsDataURL(file);
  });

  root.querySelector("#submit-article-btn").addEventListener("click", () => {
    const title = root.querySelector("#article-title").value.trim();
    const category = root.querySelector("#article-category").value.trim() || "عام";
    const content = root.querySelector("#article-content").value.trim();
    if(!title || !content){
      showToast("يرجى إدخال عنوان ومحتوى المقال قبل الإرسال");
      return;
    }
    store.submitArticle({ authorId: user.id, title, category, content, image: pendingImage });
    showToast("أُرسل مقالك — بانتظار مراجعة فريق الإشراف");
    root.querySelector("#article-title").value = "";
    root.querySelector("#article-category").value = "";
    root.querySelector("#article-content").value = "";
    pendingImage = null;
    root.querySelector("#image-upload-preview").innerHTML = `${icon("image", { size: 22 })}<span>أضف صورة توضيحية للمقال</span>`;
  });
}
