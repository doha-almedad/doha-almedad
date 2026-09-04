/* =========================================================
   دوحة المداد — writingPage.js
   3. قسم الكتابة: المساحة المخصصة لنشر القطع الأدبية والفصول
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openCommentsModal, openModal, closeModal } from "../components/modals.js";
import { icon, initial, avatarHtml, arNum } from "../components/icons.js";
import { cropImageFile } from "../services/mediaService.js";
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

function confirmDeletePost(postId, onDeleted){
  const post = store.getPosts().find(p => p.id === postId);
  const currentUser = store.getCurrentUser();
  if(!post || post.authorId !== currentUser.id) return;

  openModal(`
    <div class="modal-box__head"><h3>حذف المنشور</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <p>هل تريد حذف «${post.title}»؟ لا يمكن التراجع عن هذا الإجراء.</p>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-ghost" data-close>إلغاء</button>
      <button class="btn btn-danger" id="confirm-delete-post">حذف المنشور</button>
    </div>
  `, {
    onMount(box){
      box.querySelector("#confirm-delete-post").addEventListener("click", () => {
        store.deletePost(postId);
        closeModal();
        showToast("تم حذف منشورك");
        if(typeof onDeleted === "function") onDeleted();
      });
    }
  });
}

export function openEditPostModal(postId, onUpdated, { admin = false } = {}){
  const post = store.getPosts().find(p => p.id === postId);
  const current = store.getCurrentUser();
  const canEdit = admin || current.role === "owner" || current.role === "moderator" || post?.authorId === current.id;
  if(!post || !canEdit) return;
  let pendingImages = [...(post.images || (post.image ? [post.image] : []))];
  openModal(`
    <div class="modal-box__head"><h3>تعديل المنشور</h3><button class="modal-close" data-close>${icon("close", { size:18 })}</button></div>
    <div class="field"><label>العنوان</label><input id="edit-post-title" value="${post.title}"></div>
    <div class="field"><label>نوع النص</label><select id="edit-post-type">${TEXT_TYPES.map(t => `<option value="${t.value}" ${t.value===post.type?"selected":""}>${t.label}</option>`).join("")}</select></div>
    <div class="field"><label>النص</label><textarea id="edit-post-content">${post.content}</textarea></div>
    <div class="field"><label>صور المنشور</label><label class="image-upload"><span>${icon("image", { size:20 })}<span>إضافة صورة أو استبدالها</span></span><input type="file" id="edit-post-images" accept="image/*" multiple hidden></label><div id="edit-post-image-list"></div></div>
    <button class="btn btn-primary btn-block" id="save-post-edit">حفظ التعديلات</button>
  `, { size:"lg", onMount(box){
    const paintImages = () => {
      box.querySelector("#edit-post-image-list").innerHTML = pendingImages.length ? `<div class="multi-image-strip">${pendingImages.map((src,i) => `<div class="multi-image-strip__item"><img src="${src}" alt=""><button type="button" class="multi-image-strip__remove" data-remove-edit-image="${i}">${icon("close", {size:9})}</button></div>`).join("")}</div>` : `<small class="text-muted">لا توجد صور</small>`;
      box.querySelectorAll("[data-remove-edit-image]").forEach(btn => btn.onclick = () => { pendingImages.splice(Number(btn.dataset.removeEditImage),1); paintImages(); });
    };
    paintImages();
    box.querySelector("#edit-post-images").addEventListener("change", async e => {
      for(const file of Array.from(e.target.files || [])){ const image = await cropImageFile(file, { aspectRatio:16/9, outputWidth:1200, title:"اختر قالب صورة المنشور" }); if(image) pendingImages.push(image); }
      paintImages();
    });
    box.querySelector("#save-post-edit").addEventListener("click", () => {
      const title = box.querySelector("#edit-post-title").value.trim();
      const content = box.querySelector("#edit-post-content").value.trim();
      if(!title || !content){ showToast("يرجى إدخال العنوان والنص"); return; }
      store.updatePost(postId, { title, content, type:box.querySelector("#edit-post-type").value, wordCount:wordCount(content), images:pendingImages, image:null });
      closeModal(); showToast("تم حفظ التعديلات");
      if(typeof onUpdated === "function") onUpdated();
    });
  }});
}

function renderFeed(){
  const all = store.getPosts();
  const posts = all.slice(0, visibleCount);
  const currentUser = store.getCurrentUser();

  if(!all.length){
    return `<div class="empty-state"><div class="empty-state__icon">${icon("feather", { size: 30 })}</div><p>لم يُنشر أي نص بعد. كن أول من يخطّ حرفًا هنا.</p></div>`;
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
            <div class="feed-item__time">${timeAgo(p.date)} ${p.editedAt ? `· تم التعديل ${timeAgo(p.editedAt)}` : ""}</div>
          </div>
          <div class="feed-item__head-actions">
            <span class="badge-pill badge-pill--gold">${typeLabel(p.type)}</span>
            ${p.authorId === currentUser.id ? `<button type="button" class="feed-item__delete" data-delete-post="${p.id}">${icon("close", { size: 12 })}<span>حذف</span></button>` : ""}
            ${p.authorId === currentUser.id ? `<button type="button" class="feed-item__edit" data-edit-post="${p.id}">${icon("feather", { size: 12 })}<span>تعديل</span></button>` : ""}
          </div>
        </div>
        ${renderCarousel(images, { size: "full" })}
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
        for(const file of files){
          const cropped = await cropImageFile(file, { aspectRatio:16/9, outputWidth:1200, title:"قص صورة المنشور" });
          if(cropped) pendingImages.push(cropped);
        }
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

/** صفحة كاملة مستقلة لعرض منشور واحد — وليست نافذة منبثقة */
export function renderPostViewPage(root, postId){
  const p = store.getPosts().find(x => x.id === postId);
  if(!p){
    root.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لم يُعثر على هذا المنشور.</p></div></div>`;
    return;
  }
  const author = store.getUser(p.authorId);
  const images = p.images || (p.image ? [p.image] : []);
  const currentUser = store.getCurrentUser();
  const liked = (p.likedBy || []).includes(currentUser.id);
  const commentCount = (p.comments || []).length;

  root.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <a href="#/writing" class="text-muted" style="font-size:.85rem;display:inline-flex;align-items:center;gap:6px;">${icon("chevronRight", { size: 14 })}<span>العودة إلى الكتابة</span></a>

        <div class="card article-view" style="margin-top:16px;">
          <div class="highlight-card__meta" style="margin-bottom:14px;">
            <span class="badge-pill">${author?.displayName || "عضو"}</span>
            <span class="badge-pill badge-pill--gold">${typeLabel(p.type)}</span>
            <span class="badge-pill">${timeAgo(p.date)}</span>
            ${p.editedAt ? `<span class="badge-pill">تم التعديل ${timeAgo(p.editedAt)}</span>` : ""}
            ${p.authorId === currentUser.id ? `<button type="button" class="feed-item__delete" data-delete-post="${p.id}">${icon("close", { size: 12 })}<span>حذف</span></button>` : ""}
            ${p.authorId === currentUser.id ? `<button type="button" class="feed-item__edit" data-edit-post="${p.id}">${icon("feather", { size: 12 })}<span>تعديل</span></button>` : ""}
          </div>
          <h1>${p.title}</h1>
          ${renderCarousel(images, { size: "full" })}
          <p style="white-space:pre-line;">${p.content}</p>
          <div class="feed-item__actions">
            <span data-like="${p.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${arNum((p.likedBy||[]).length)})</span>
            <span data-comment="${p.id}">${icon("comment", { size: 15 })} تعليق (${arNum(commentCount)})</span>
          </div>
        </div>
      </div>
    </section>
  `;

  bindCarousels(root);
  root.querySelector("[data-like]").addEventListener("click", () => {
    store.toggleLike("post", p.id, currentUser.id);
    renderPostViewPage(root, postId);
  });
  root.querySelector("[data-comment]").addEventListener("click", () => openCommentsModal("post", p.id, () => renderPostViewPage(root, postId)));
  root.querySelector("[data-delete-post]")?.addEventListener("click", () => confirmDeletePost(p.id, () => { window.location.hash = "#/writing"; }));
  root.querySelector("[data-edit-post]")?.addEventListener("click", () => openEditPostModal(p.id, () => renderPostViewPage(root, postId)));
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
    feed.querySelectorAll("[data-delete-post]").forEach(el => {
      el.addEventListener("click", () => confirmDeletePost(el.getAttribute("data-delete-post"), paint));
    });
    feed.querySelectorAll("[data-edit-post]").forEach(el => {
      el.addEventListener("click", () => openEditPostModal(el.getAttribute("data-edit-post"), paint));
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
