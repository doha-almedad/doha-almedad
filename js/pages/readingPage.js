/* =========================================================
   دوحة المداد — readingPage.js
   4. قسم القراءة: مراجعات الكتب وتقييمات الأعضاء
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast } from "../components/modals.js";

function stars(n){ return "★".repeat(n) + "☆".repeat(5 - n); }

function renderFeed(){
  const reviews = store.getReviews();
  if(!reviews.length){
    return `<div class="empty-state"><div class="empty-state__icon">📖</div><p>لا مراجعات بعد. شارك أول قراءاتك مع الدوحة.</p></div>`;
  }
  return reviews.map(r => {
    const author = store.getUser(r.authorId);
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm">${author?.avatarEmoji || "📖"}</div>
          <div>
            <div class="feed-item__name">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${r.bookTitle}</div>
          </div>
          <span class="rating-stars" style="margin-inline-start:auto;">${stars(r.rating)}</span>
        </div>
        <p>${r.content}</p>
        <div class="feed-item__actions">
          <span data-like="${r.id}">🤍 إعجاب (${r.likes})</span>
          <span>💬 تعليق</span>
        </div>
      </article>
    `;
  }).join("");
}

export function renderReadingPage(root){
  const user = store.getCurrentUser();

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">رفيقك في الرحلة</span><h1>القراءة</h1></div>
        </div>

        <div class="card composer" style="margin-bottom:34px;">
          <h3 style="margin-bottom:14px;">📚 سجّل قراءة جديدة</h3>
          <div class="composer__meta">
            <div class="field">
              <label>عنوان الكتاب</label>
              <input type="text" id="book-title" placeholder="اسم الكتاب">
            </div>
            <div class="field" style="max-width:160px;">
              <label>تقييمك</label>
              <select id="book-rating">
                <option value="5">★★★★★</option>
                <option value="4">★★★★☆</option>
                <option value="3">★★★☆☆</option>
                <option value="2">★★☆☆☆</option>
                <option value="1">★☆☆☆☆</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>مراجعتك</label>
            <textarea id="book-review" placeholder="ما الذي أعجبك أو لم يعجبك في هذه القراءة؟"></textarea>
          </div>
          <button class="btn btn-primary" id="publish-review-btn">تسجيل القراءة ونشر المراجعة</button>
        </div>

        <div class="section-head"><h2>مراجعات المجتمع</h2></div>
        <div id="reading-feed">${renderFeed()}</div>
      </div>
    </section>
  `;

  root.querySelector("#publish-review-btn").addEventListener("click", () => {
    const bookTitle = root.querySelector("#book-title").value.trim();
    const content = root.querySelector("#book-review").value.trim();
    const rating = Number(root.querySelector("#book-rating").value);
    if(!bookTitle || !content){
      showToast("يرجى إدخال اسم الكتاب ومراجعة قبل النشر");
      return;
    }
    store.addReview({ authorId: user.id, bookTitle, content, rating });
    processActivity(user.id, "publish_review", {});
    showToast("سُجّلت قراءتك — أضيئت شعلة حماستك اليوم 🔥");
    renderReadingPage(root);
  });

  root.querySelectorAll("[data-like]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-like");
      const rev = store.getReviews().find(r => r.id === id);
      if(rev){ rev.likes++; store.commit(); renderReadingPage(root); }
    });
  });
}
