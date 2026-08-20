/* =========================================================
   دوحة المداد — readingPage.js
   4. قسم القراءة: مراجعات الكتب وتقييمات الأعضاء
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openCommentsModal } from "../components/modals.js";
import { icon, initial } from "../components/icons.js";

const PAGE_SIZE = 3;
let visibleCount = PAGE_SIZE;

function stars(n){
  return Array.from({ length: 5 }, (_, i) => icon("star", { size: 13, cls: i < n ? "star-filled" : "star-empty" })).join("");
}

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${Math.max(1,diffMin)} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h/24)} يوم`;
}

function renderFeed(){
  const all = store.getReviews();
  const reviews = all.slice(0, visibleCount);
  const currentUser = store.getCurrentUser();

  if(!all.length){
    return `<div class="empty-state"><div class="empty-state__icon">${icon("book", { size: 30 })}</div><p>لا مراجعات بعد. شارك أول قراءاتك مع الدوحة.</p></div>`;
  }

  const cards = reviews.map(r => {
    const author = store.getUser(r.authorId);
    const liked = (r.likedBy || []).includes(currentUser.id);
    const commentCount = (r.comments || []).length;
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm participant-link" data-user-id="${r.authorId}">${initial(author?.displayName)}</div>
          <div>
            <div class="feed-item__name participant-link" data-user-id="${r.authorId}">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${r.bookTitle}</div>
          </div>
          <span class="rating-stars" style="margin-inline-start:auto;">${stars(r.rating)}</span>
        </div>
        ${r.image ? `<img src="${r.image}" alt="" class="feed-item__image">` : ""}
        <p>${r.content}</p>
        <div class="feed-item__actions">
          <span data-like="${r.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${(r.likedBy||[]).length})</span>
          <span data-comment="${r.id}">${icon("comment", { size: 15 })} تعليق (${commentCount})</span>
        </div>
      </article>
    `;
  }).join("");

  const more = all.length > reviews.length
    ? `<button class="btn btn-outline btn-block" id="load-more-reviews">الاطلاع على المزيد</button>`
    : "";

  return cards + more;
}

export function renderReadingPage(root){
  const user = store.getCurrentUser();
  visibleCount = PAGE_SIZE;
  let pendingImage = null;

  function paint(){
    root.querySelector("#reading-feed").innerHTML = renderFeed();
    bindFeedEvents();
  }

  function bindFeedEvents(){
    const feed = root.querySelector("#reading-feed");
    bindParticipantLinks(feed);
    feed.querySelectorAll("[data-like]").forEach(el => {
      el.addEventListener("click", () => {
        store.toggleLike("review", el.getAttribute("data-like"), user.id);
        paint();
      });
    });
    feed.querySelectorAll("[data-comment]").forEach(el => {
      el.addEventListener("click", () => openCommentsModal("review", el.getAttribute("data-comment"), paint));
    });
    feed.querySelector("#load-more-reviews")?.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      paint();
    });
  }

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">رفيقك في الرحلة</span><h1>${icon("book", { size: 26, cls: "heading-icon" })} القراءة</h1></div>
        </div>

        <div class="card composer" style="margin-bottom:34px;">
          <h3 style="margin-bottom:14px;">سجّل قراءة جديدة</h3>
          <div class="composer__meta">
            <div class="field">
              <label>عنوان الكتاب</label>
              <input type="text" id="book-title" placeholder="اسم الكتاب">
            </div>
            <div class="field" style="max-width:160px;">
              <label>تقييمك</label>
              <select id="book-rating">
                <option value="5">5 — ممتاز</option>
                <option value="4">4 — جيد جداً</option>
                <option value="3">3 — جيد</option>
                <option value="2">2 — مقبول</option>
                <option value="1">1 — ضعيف</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>مراجعتك</label>
            <textarea id="book-review" placeholder="ما الذي أعجبك أو لم يعجبك في هذه القراءة؟"></textarea>
          </div>
          <div class="field">
            <label>صورة غلاف الكتاب (اختياري)</label>
            <label class="image-upload" id="image-upload-label">
              <span id="image-upload-preview">${icon("image", { size: 22 })}<span>أضف صورة الغلاف</span></span>
              <input type="file" id="book-image" accept="image/*" hidden>
            </label>
          </div>
          <button class="btn btn-primary" id="publish-review-btn">${icon("send", { size: 16 })}<span>تسجيل القراءة ونشر المراجعة</span></button>
        </div>

        <div class="section-head"><h2>مراجعات المجتمع</h2></div>
        <div id="reading-feed">${renderFeed()}</div>
      </div>
    </section>
  `;

  bindFeedEvents();

  root.querySelector("#book-image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImage = reader.result;
      root.querySelector("#image-upload-preview").innerHTML = `<img src="${pendingImage}" alt="" class="image-upload__thumb"><span>تم اختيار الصورة — انقر للتغيير</span>`;
    };
    reader.readAsDataURL(file);
  });

  root.querySelector("#publish-review-btn").addEventListener("click", () => {
    const bookTitle = root.querySelector("#book-title").value.trim();
    const content = root.querySelector("#book-review").value.trim();
    const rating = Number(root.querySelector("#book-rating").value);
    if(!bookTitle || !content){
      showToast("يرجى إدخال اسم الكتاب ومراجعة قبل النشر");
      return;
    }
    store.addReview({ authorId: user.id, bookTitle, content, rating, image: pendingImage });
    processActivity(user.id, "publish_review", {});
    showToast("سُجّلت قراءتك — أضيئت شعلة حماستك اليوم");
    visibleCount = PAGE_SIZE;
    root.querySelector("#book-title").value = "";
    root.querySelector("#book-review").value = "";
    pendingImage = null;
    root.querySelector("#image-upload-preview").innerHTML = `${icon("image", { size: 22 })}<span>أضف صورة الغلاف</span>`;
    paint();
  });
}
