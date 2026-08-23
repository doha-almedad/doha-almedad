/* =========================================================
   دوحة المداد — writingPage.js
   3. قسم الكتابة: المساحة المخصصة لنشر القطع الأدبية والفصول
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openCommentsModal, openModal, closeModal } from "../components/modals.js";
import { icon, initial, avatarHtml, arNum } from "../components/icons.js";
import { resizeImageFile } from "../services/mediaService.js";
import { renderCarousel, bindCarousels } from "../components/carousel.js";

const TEXT_TYPES = [
  { value: "piece",   label: "قطعة أدبية" },
  { value: "chapter",  label: "فصل من عمل" },
  { value: "story",   label: "قصة قصيرة" },
  { value: "poem",    label: "نص شعري" },
  { value: "reflection", label: "خاطرة" },
  { value: "opinion",  label: "مقالة رأي" },
];

const PAGE_SIZE = 3;
let visibleCount = PAGE_SIZE;

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${arNum(Math.max(1,diffMin))} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${arNum(h)} س`;
  return `منذ ${arNum(Math.round(h/24))} يوم`;
}

function wordCount(text){ return text.trim().split(/\s+/).filter(Boolean).length; }
function typeLabel(value){ return TEXT_TYPES.find(t => t.value === value)?.label || "قطعة أدبية"; }

function renderFeed(){
  const all = store.getPosts();
  const posts = all.slice(0, visibleCount);
  const currentUser = store.getCurrentUser();

  if(!all.length){
    return `<div class="empty-state"><div class="empty-state__icon">${icon("feather", { size: 30 })}</div><p>لم يُنشر أي نص بعد. كن أول من يخطّ حرفاً هنا.</p></div>`;
  }

  const cards = posts.map(p => {
    const author = store.getUser(p.authorId);
    const liked = (p.likedBy || []).includes(currentUser.id);
    const commentCount = (p.comments || []).length;
    const images = p.images || (p.image ? [p.image] : []);
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm participant-link" data-user-id="${p.authorId}">${avatarHtml(author)}</div>
          <div>
            <div class="feed-item__name participant-link" data-user-id="${p.authorId}">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${timeAgo(p.date)}</div>
          </div>
          <span class="badge-pill badge-pill--gold" style="margin-inline-start:auto;">${typeLabel(p.type)}</span>
        </div>
        ${renderCarousel(images)}
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <div class="feed-item__actions">
          <span data-like="${p.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${arNum((p.likedBy||[]).length)})</span>
          <span data-comment="${p.id}">${icon("comment", { size: 15 })} تعليق (${arNum(commentCount)})</span>
          <span>${icon("document", { size: 15 })} ${arNum(wordCount(p.content))} كلمة</span>
        </div>
      </article>
    `;
  }).join("");

  const more = all.length > posts.length
    ? `<button class="btn btn-outline btn-block" id="load-more-posts">الاطلاع على المزيد</button>`
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
    <div class="modal-box__head"><h3>انشر قطعة جديدة</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="composer__meta">
      <div class="field">
        <label>عنوان النص</label>
        <input type="text" id="post-title" placeholder="عنوان قطعتك الأدبية">
      </div>
      <div class="field" style="max-width:180px;">
        <label>نوع النص</label>
        <select id="post-type">
          ${TEXT_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="field">
      <label>النص</label>
      <textarea id="post-content" placeholder="اكتب هنا... كل كلمة تُحتسب ضمن مسيرتك الأدبية."></textarea>
    </div>
    <div class="field">
      <label>صور مرافقة (اختياري — يمكن اختيار أكثر من صورة)</label>
      <label class="image-upload" id="image-upload-label">
        <span>${icon("image", { size: 22 })}<span>أضف صورة أو أكثر تصاحب النص</span></span>
        <input type="file" id="post-image" accept="image/*" multiple hidden>
      </label>
      <div id="image-preview-strip">${previewStrip()}</div>
    </div>
    <button class="btn btn-primary btn-block" id="publish-post-btn">${icon("send", { size: 16 })}<span>نشر</span></button>
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

      box.querySelector("#post-image").addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        if(!files.length) return;
        const resized = await Promise.all(files.map(f => resizeImageFile(f)));
        pendingImages.push(...resized);
        refreshStrip();
      });

      box.querySelector("#publish-post-btn").addEventListener("click", () => {
        const title = box.querySelector("#post-title").value.trim();
        const content = box.querySelector("#post-content").value.trim();
        const type = box.querySelector("#post-type").value;
        if(!title || !content){
          showToast("يرجى إدخال عنوان ونص قبل النشر");
          return;
        }
        store.addPost({ authorId: user.id, title, content, type, images: pendingImages, wordCount: wordCount(content) });
        processActivity(user.id, "publish_post", {
          wordCount: wordCount(content),
          isFullWork: type === "chapter"
        });
        closeModal();
        showToast("نُشر نصّك — أضيئت شعلة حماستك اليوم");
        visibleCount = PAGE_SIZE;
        paint();
      });
    }
  });
}

export function renderWritingPage(root){
  const user = store.getCurrentUser();
  visibleCount = PAGE_SIZE;

  function paint(){
    root.querySelector("#writing-feed").innerHTML = renderFeed();
    bindFeedEvents();
  }

  function bindFeedEvents(){
    const feed = root.querySelector("#writing-feed");
    bindParticipantLinks(feed);
    bindCarousels(feed);
    feed.querySelectorAll("[data-like]").forEach(el => {
      el.addEventListener("click", () => {
        store.toggleLike("post", el.getAttribute("data-like"), user.id);
        paint();
      });
    });
    feed.querySelectorAll("[data-comment]").forEach(el => {
      el.addEventListener("click", () => openCommentsModal("post", el.getAttribute("data-comment"), paint));
    });
    feed.querySelector("#load-more-posts")?.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      paint();
    });
  }

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">مساحتك الأدبية</span><h1>${icon("feather", { size: 26, cls: "heading-icon" })} الكتابة</h1></div>
        </div>
        <div class="section-head"><h2>آخر المنشورات</h2></div>
        <div id="writing-feed">${renderFeed()}</div>
      </div>
    </section>
    <button class="fab-btn" id="writing-fab" aria-label="نشر قطعة جديدة">${icon("plus", { size: 24 })}</button>
  `;

  bindFeedEvents();
  root.querySelector("#writing-fab").addEventListener("click", () => openComposerModal(root, user, paint));
}
