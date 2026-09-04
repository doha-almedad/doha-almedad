/* =========================================================
   دوحة المداد — readingPage.js
   4. قسم القراءة: مراجعات الكتب وتقييمات الأعضاء
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openCommentsModal, openModal, closeModal } from "../components/modals.js";
import { icon, initial, avatarHtml, arNum } from "../components/icons.js";
import { cropImageFile } from "../services/mediaService.js";
import { renderCarousel, bindCarousels } from "../components/carousel.js";

const PAGE_SIZE = 3;
let visibleCount = PAGE_SIZE;

function stars(n){
  return Array.from({ length: 5 }, (_, i) => icon("star", { size: 13, cls: i < n ? "star-filled" : "star-empty" })).join("");
}

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${arNum(Math.max(1,diffMin))} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${arNum(h)} س`;
  return `منذ ${arNum(Math.round(h/24))} يوم`;
}

export function openEditReviewModal(reviewId, onUpdated, { admin = false } = {}){
  const review = store.getReviews().find(r=>r.id===reviewId);
  const current = store.getCurrentUser();
  if(!review || !(admin || current.role === "owner" || current.role === "moderator" || review.authorId === current.id)) return;
  let images=[...(review.images || (review.image?[review.image]:[]))];
  openModal(`<div class="modal-box__head"><h3>تعديل القراءة</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div><div class="field"><label>عنوان الكتاب</label><input id="edit-review-title" value="${review.bookTitle}"></div><div class="field"><label>التقييم</label><select id="edit-review-rating">${[5,4,3,2,1].map(n=>`<option value="${n}" ${review.rating===n?"selected":""}>${n} من 5</option>`).join("")}</select></div><div class="field"><label>المراجعة</label><textarea id="edit-review-content">${review.content}</textarea></div><div class="field"><label>الصور</label><label class="image-upload"><span>${icon("image",{size:20})}<span>إضافة صور</span></span><input type="file" id="edit-review-images" accept="image/*" multiple hidden></label><div id="edit-review-image-list"></div></div><button class="btn btn-primary btn-block" id="save-review-edit">حفظ التعديلات</button>`,{size:"lg",onMount(box){
    const paint=()=>{box.querySelector("#edit-review-image-list").innerHTML=images.length?`<div class="multi-image-strip">${images.map((src,i)=>`<div class="multi-image-strip__item"><img src="${src}" alt=""><button type="button" class="multi-image-strip__remove" data-remove-review-image="${i}">${icon("close",{size:9})}</button></div>`).join("")}</div>`:`<small class="text-muted">لا توجد صور</small>`;box.querySelectorAll("[data-remove-review-image]").forEach(btn=>btn.onclick=()=>{images.splice(Number(btn.dataset.removeReviewImage),1);paint();});};paint();
    box.querySelector("#edit-review-images").onchange=async e=>{for(const file of Array.from(e.target.files||[])){const image=await cropImageFile(file,{aspectRatio:16/9,outputWidth:1200,title:"اختر قالب صورة القراءة"});if(image)images.push(image);}paint();};
    box.querySelector("#save-review-edit").onclick=()=>{const bookTitle=box.querySelector("#edit-review-title").value.trim(),content=box.querySelector("#edit-review-content").value.trim();if(!bookTitle||!content){showToast("أكمل عنوان الكتاب والمراجعة");return;}store.updateReview(reviewId,{bookTitle,content,rating:Number(box.querySelector("#edit-review-rating").value),images,image:null});closeModal();showToast("تم تعديل القراءة");if(typeof onUpdated==="function")onUpdated();};
  }});
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
    const images = r.images || (r.image ? [r.image] : []);
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm participant-link" data-user-id="${r.authorId}">${avatarHtml(author)}</div>
          <div>
            <div class="feed-item__name participant-link" data-user-id="${r.authorId}">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${r.bookTitle} · ${timeAgo(r.date)} ${r.editedAt ? `· تم التعديل ${timeAgo(r.editedAt)}` : ""}</div>
          </div>
          <div class="feed-item__head-actions"><span class="rating-stars">${stars(r.rating)}</span>${r.authorId===currentUser.id?`<button type="button" class="feed-item__edit" data-edit-review="${r.id}">${icon("feather",{size:12})}<span>تعديل</span></button>`:""}</div>
        </div>
        ${renderCarousel(images)}
        <p>${r.content}</p>
        <div class="feed-item__actions">
          <span data-like="${r.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${arNum((r.likedBy||[]).length)})</span>
          <span data-comment="${r.id}">${icon("comment", { size: 15 })} تعليق (${arNum(commentCount)})</span>
        </div>
      </article>
    `;
  }).join("");

  const more = all.length > reviews.length
    ? `<button class="btn btn-outline btn-block" id="load-more-reviews">الاطلاع على المزيد</button>`
    : "";

  return cards + more;
}

function openComposerModal(root, user, paint){
  let pendingImages = [];

  function previewStrip(){
    return pendingImages.length
      ? `<div class="multi-image-strip">${pendingImages.map((src, i) => `
          <div class="multi-image-strip__item"><img src="${src}" alt=""><button type="button" class="multi-image-strip__remove" data-remove-img="${i}">${icon("close", { size: 9 })}</button></div>
        `).join("")}</div>`
      : "";
  }

  openModal(`
    <div class="modal-box__head"><h3>سجّل قراءة جديدة</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="composer__meta">
      <div class="field">
        <label>عنوان الكتاب</label>
        <input type="text" id="book-title" placeholder="اسم الكتاب">
      </div>
      <div class="field" style="max-width:160px;">
        <label>تقييمك</label>
        <select id="book-rating">
          <option value="5">5 — ممتاز</option>
          <option value="4">4 — جيد جدًا</option>
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
      <label>صور غلاف الكتاب (اختياري — يمكن اختيار أكثر من صورة)</label>
      <label class="image-upload" id="image-upload-label">
        <span>${icon("image", { size: 22 })}<span>أضف صورة الغلاف أو أكثر</span></span>
        <input type="file" id="book-image" accept="image/*" multiple hidden>
      </label>
      <div id="image-preview-strip">${previewStrip()}</div>
    </div>
    <button class="btn btn-primary btn-block" id="publish-review-btn">${icon("send", { size: 16 })}<span>تسجيل القراءة ونشر المراجعة</span></button>
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

      box.querySelector("#book-image").addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        if(!files.length) return;
        for(const file of files){
          const image = await cropImageFile(file, { aspectRatio:16/9, outputWidth:1200, title:"اختر قالب صورة القراءة" });
          if(image) pendingImages.push(image);
        }
        refreshStrip();
      });

      box.querySelector("#publish-review-btn").addEventListener("click", () => {
        const bookTitle = box.querySelector("#book-title").value.trim();
        const content = box.querySelector("#book-review").value.trim();
        const rating = Number(box.querySelector("#book-rating").value);
        if(!bookTitle || !content){
          showToast("يرجى إدخال اسم الكتاب ومراجعة قبل النشر");
          return;
        }
        store.addReview({ authorId: user.id, bookTitle, content, rating, images: pendingImages });
        processActivity(user.id, "publish_review", {});
        closeModal();
        showToast("سُجّلت قراءتك — أضيئت شعلة حماستك اليوم");
        visibleCount = PAGE_SIZE;
        paint();
      });
    }
  });
}

/** صفحة كاملة مستقلة لعرض مراجعة واحدة — وليست نافذة منبثقة */
export function renderReviewViewPage(root, reviewId){
  const r = store.getReviews().find(x => x.id === reviewId);
  if(!r){
    root.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لم يُعثر على هذه المراجعة.</p></div></div>`;
    return;
  }
  const author = store.getUser(r.authorId);
  const images = r.images || (r.image ? [r.image] : []);
  const currentUser = store.getCurrentUser();
  const liked = (r.likedBy || []).includes(currentUser.id);
  const commentCount = (r.comments || []).length;

  root.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <a href="#/reading" class="text-muted" style="font-size:.85rem;display:inline-flex;align-items:center;gap:6px;">${icon("chevronRight", { size: 14 })}<span>العودة إلى القراءة</span></a>

        <div class="card article-view" style="margin-top:16px;">
          <div class="highlight-card__meta" style="margin-bottom:14px;">
            <span class="badge-pill">${author?.displayName || "عضو"}</span>
            <span class="rating-stars">${stars(r.rating)}</span>
            <span class="badge-pill">${timeAgo(r.date)}${r.editedAt ? ` · تم التعديل ${timeAgo(r.editedAt)}` : ""}</span>
          </div>
          <h1>${r.bookTitle}</h1>
          ${renderCarousel(images)}
          <p style="white-space:pre-line;">${r.content}</p>
          <div class="feed-item__actions">
            <span data-like="${r.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${arNum((r.likedBy||[]).length)})</span>
            <span data-comment="${r.id}">${icon("comment", { size: 15 })} تعليق (${arNum(commentCount)})</span>
          </div>
        </div>
      </div>
    </section>
  `;

  bindCarousels(root);
  root.querySelector("[data-like]").addEventListener("click", () => {
    store.toggleLike("review", r.id, currentUser.id);
    renderReviewViewPage(root, reviewId);
  });
  root.querySelector("[data-comment]").addEventListener("click", () => openCommentsModal("review", r.id, () => renderReviewViewPage(root, reviewId)));
  if(r.authorId===currentUser.id){
    const actions=root.querySelector(".highlight-card__meta");
    actions?.insertAdjacentHTML("beforeend",`<button class="btn btn-outline btn-sm" id="edit-review-view">${icon("feather",{size:12})} تعديل</button>`);
    root.querySelector("#edit-review-view")?.addEventListener("click",()=>openEditReviewModal(r.id,()=>renderReviewViewPage(root,reviewId)));
  }
}

export function renderReadingPage(root){
  const user = store.getCurrentUser();
  const sectionName = store.getSettings().sectionNames.reading;
  visibleCount = PAGE_SIZE;

  function paint(){
    root.querySelector("#reading-feed").innerHTML = renderFeed();
    bindFeedEvents();
  }

  function bindFeedEvents(){
    const feed = root.querySelector("#reading-feed");
    bindParticipantLinks(feed);
    bindCarousels(feed);
    feed.querySelectorAll("[data-like]").forEach(el => {
      el.addEventListener("click", () => {
        store.toggleLike("review", el.getAttribute("data-like"), user.id);
        paint();
      });
    });
    feed.querySelectorAll("[data-comment]").forEach(el => {
      el.addEventListener("click", () => openCommentsModal("review", el.getAttribute("data-comment"), paint));
    });
    feed.querySelectorAll("[data-edit-review]").forEach(el=>el.addEventListener("click",()=>openEditReviewModal(el.dataset.editReview,paint)));
    feed.querySelector("#load-more-reviews")?.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      paint();
    });
  }

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">رفيقك في الرحلة</span><h1>${icon("book", { size: 26, cls: "heading-icon" })} ${sectionName}</h1></div>
        </div>
        <div class="section-head"><h2>مراجعات المجتمع</h2></div>
        <div id="reading-feed">${renderFeed()}</div>
      </div>
    </section>
    <button class="fab-btn" id="reading-fab" aria-label="تسجيل قراءة جديدة">${icon("plus", { size: 24 })}</button>
  `;

  bindFeedEvents();
  root.querySelector("#reading-fab").addEventListener("click", () => openComposerModal(root, user, paint));
}
