/* =========================================================
   دوحة المداد — articlesPage.js
   6. قسم المقالات والملخصات: محتوى تعليمي ومحرك بحث حي
   ========================================================= */

import { store } from "../db/store.js";
import { openModal, closeModal, showToast } from "../components/modals.js";
import { icon, arNum } from "../components/icons.js";
import { resizeImageFile } from "../services/mediaService.js";
import { renderCarousel, bindCarousels } from "../components/carousel.js";

const CATEGORIES = [
  { value: "مقال", label: "مقال" },
  { value: "ملخص", label: "ملخص" },
];

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${arNum(Math.max(1,diffMin))} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${arNum(h)} س`;
  return `منذ ${arNum(Math.round(h/24))} يوم`;
}

function openArticleModal(a){
  const author = store.getUser(a.author);
  const images = a.images || (a.image ? [a.image] : []);
  openModal(`
    <div class="modal-box__head"><h3>${a.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="highlight-card__meta" style="margin-bottom:12px;">
      <span class="badge-pill badge-pill--ember">${a.category}</span>
      <span class="badge-pill">${author?.displayName || "كاتب"}</span>
      <span class="badge-pill">${timeAgo(a.date)}</span>
    </div>
    <div id="article-modal-media">${renderCarousel(images)}</div>
    <p style="white-space:pre-line;">${a.content}</p>
  `, {
    size: "lg",
    onMount(box){ bindCarousels(box); }
  });
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
        <span>${timeAgo(a.date)}</span>
      </div>
      <button class="btn btn-outline btn-sm btn-block" style="margin-top:12px;" data-article-id="${a.id}">${icon("document", { size: 14 })}<span>اقرأ الآن</span></button>
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
    const open = (e) => {
      e?.stopPropagation();
      const article = store.getArticles().find(a => a.id === card.getAttribute("data-article-id"));
      if(article) openArticleModal(article);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(e); } });
  });
}

function openComposerModal(user, refreshList){
  let pendingImages = [];

  function previewStrip(){
    return pendingImages.length
      ? `<div class="multi-image-strip">${pendingImages.map((src, i) => `
          <div class="multi-image-strip__item"><img src="${src}" alt=""><button type="button" class="multi-image-strip__remove" data-remove-img="${i}">${icon("close", { size: 9 })}</button></div>
        `).join("")}</div>`
      : "";
  }

  openModal(`
    <div class="modal-box__head"><h3>اكتب مقالاً أو ملخصاً جديداً</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <p class="text-muted" style="font-size:.82rem;margin-bottom:14px;">سيراجع فريق الإشراف مقالك قبل نشره في هذه الصفحة.</p>
    <div class="composer__meta">
      <div class="field">
        <label>العنوان</label>
        <input type="text" id="article-title" placeholder="عنوان المقال أو الملخص">
      </div>
      <div class="field" style="max-width:170px;">
        <label>النوع</label>
        <select id="article-category">
          ${CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="field">
      <label>المحتوى</label>
      <textarea id="article-content" placeholder="اكتب هنا..."></textarea>
    </div>
    <div class="field">
      <label>صور توضيحية (اختياري)</label>
      <label class="image-upload" id="image-upload-label">
        <span>${icon("image", { size: 22 })}<span>أضف صورة أو أكثر</span></span>
        <input type="file" id="article-image" accept="image/*" multiple hidden>
      </label>
      <div id="image-preview-strip">${previewStrip()}</div>
    </div>
    <button class="btn btn-primary btn-block" id="submit-article-btn">${icon("send", { size: 16 })}<span>إرسال للمراجعة</span></button>
  `, {
    size: "lg",
    onMount(box){
      function refreshStrip(){
        box.querySelector("#image-preview-strip").innerHTML = previewStrip();
        box.querySelectorAll("[data-remove-img]").forEach(btn => {
          btn.addEventListener("click", () => {
            pendingImages.splice(Number(btn.getAttribute("data-remove-img")), 1);
            refreshStrip();
          });
        });
      }
      refreshStrip();

      box.querySelector("#article-image").addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        if(!files.length) return;
        const resized = await Promise.all(files.map(f => resizeImageFile(f)));
        pendingImages.push(...resized);
        refreshStrip();
      });

      box.querySelector("#submit-article-btn").addEventListener("click", () => {
        const title = box.querySelector("#article-title").value.trim();
        const category = box.querySelector("#article-category").value;
        const content = box.querySelector("#article-content").value.trim();
        if(!title || !content){
          showToast("يرجى إدخال عنوان ومحتوى قبل الإرسال");
          return;
        }
        store.submitArticle({ authorId: user.id, title, category, content, images: pendingImages });
        closeModal();
        showToast("أُرسل للمراجعة — بانتظار اعتماد فريق الإشراف");
      });
    }
  });
}

export function renderArticlesPage(root){
  const user = store.getCurrentUser();

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">تعلّم وتطوّر</span><h1>${icon("document", { size: 26, cls: "heading-icon" })} المقالات والملخصات</h1></div>
        </div>

        <div class="article-search-row">
          <div class="article-search">
            ${icon("search", { size: 16, cls: "article-search__icon" })}
            <input type="text" id="article-search-input" placeholder="ابحث عن مقال أو ملخص...">
            <button class="article-search__clear" id="article-search-clear" aria-label="مسح البحث" hidden>${icon("close", { size: 13 })}</button>
          </div>
          <select id="article-category-select">
            <option value="الكل">الكل</option>
            ${CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join("")}
          </select>
        </div>

        <div class="grid grid-3" id="articles-grid">
          ${store.getArticles().map(articleCard).join("")}
        </div>
        <div id="articles-empty"></div>
      </div>
    </section>
    <button class="fab-btn" id="article-fab" aria-label="اكتب مقالاً جديداً">${icon("plus", { size: 24 })}</button>
  `;

  const grid = root.querySelector("#articles-grid");
  const emptyBox = root.querySelector("#articles-empty");
  const input = root.querySelector("#article-search-input");
  const select = root.querySelector("#article-category-select");
  const clearBtn = root.querySelector("#article-search-clear");

  function update(){
    const results = filterArticles(input.value, select.value);
    grid.innerHTML = results.map(articleCard).join("");
    emptyBox.innerHTML = results.length ? "" : `<div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لا نتائج مطابقة لبحثك.</p></div>`;
    clearBtn.hidden = !input.value;
    bindArticleClicks(grid);
  }

  bindArticleClicks(grid);
  input.addEventListener("input", update);
  select.addEventListener("change", update);
  clearBtn.addEventListener("click", () => { input.value = ""; input.focus(); update(); });

  root.querySelector("#article-fab").addEventListener("click", () => openComposerModal(user, update));
}
