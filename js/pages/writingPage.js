/* =========================================================
   دوحة المداد — writingPage.js
   3. قسم الكتابة: المساحة المخصصة لنشر القطع الأدبية والفصول
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openCommentsModal } from "../components/modals.js";
import { icon, initial } from "../components/icons.js";

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
  if(diffMin < 60) return `منذ ${Math.max(1,diffMin)} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h/24)} يوم`;
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
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm participant-link" data-user-id="${p.authorId}">${initial(author?.displayName)}</div>
          <div>
            <div class="feed-item__name participant-link" data-user-id="${p.authorId}">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${timeAgo(p.date)}</div>
          </div>
          <span class="badge-pill badge-pill--gold" style="margin-inline-start:auto;">${typeLabel(p.type)}</span>
        </div>
        ${p.image ? `<img src="${p.image}" alt="" class="feed-item__image">` : ""}
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <div class="feed-item__actions">
          <span data-like="${p.id}" class="${liked ? "is-liked" : ""}">${icon("heart", { size: 15 })} إعجاب (${(p.likedBy||[]).length})</span>
          <span data-comment="${p.id}">${icon("comment", { size: 15 })} تعليق (${commentCount})</span>
          <span>${icon("document", { size: 15 })} ${wordCount(p.content)} كلمة</span>
        </div>
      </article>
    `;
  }).join("");

  const more = all.length > posts.length
    ? `<button class="btn btn-outline btn-block" id="load-more-posts">الاطلاع على المزيد</button>`
    : "";

  return cards + more;
}

export function renderWritingPage(root){
  const user = store.getCurrentUser();
  visibleCount = PAGE_SIZE;
  let pendingImage = null;

  function paint(){
    root.querySelector("#writing-feed").innerHTML = renderFeed();
    bindFeedEvents();
  }

  function bindFeedEvents(){
    const feed = root.querySelector("#writing-feed");
    bindParticipantLinks(feed);
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

        <div class="card composer" style="margin-bottom:34px;">
          <h3 style="margin-bottom:14px;">انشر قطعة جديدة</h3>
          <div class="composer__meta">
            <div class="field">
              <label>عنوان النص</label>
              <input type="text" id="post-title" placeholder="عنوان قطعتك الأدبية">
            </div>
            <div class="field" style="max-width:200px;">
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
            <label>صورة مرافقة (اختياري)</label>
            <label class="image-upload" id="image-upload-label">
              <span id="image-upload-preview">${icon("image", { size: 22 })}<span>أضف صورة تصاحب النص</span></span>
              <input type="file" id="post-image" accept="image/*" hidden>
            </label>
          </div>
          <button class="btn btn-primary" id="publish-post-btn">${icon("send", { size: 16 })}<span>نشر</span></button>
        </div>

        <div class="section-head"><h2>آخر المنشورات</h2></div>
        <div id="writing-feed">${renderFeed()}</div>
      </div>
    </section>
  `;

  bindFeedEvents();

  root.querySelector("#post-image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImage = reader.result;
      root.querySelector("#image-upload-preview").innerHTML = `<img src="${pendingImage}" alt="" class="image-upload__thumb"><span>تم اختيار الصورة — انقر للتغيير</span>`;
    };
    reader.readAsDataURL(file);
  });

  root.querySelector("#publish-post-btn").addEventListener("click", () => {
    const title = root.querySelector("#post-title").value.trim();
    const content = root.querySelector("#post-content").value.trim();
    const type = root.querySelector("#post-type").value;
    if(!title || !content){
      showToast("يرجى إدخال عنوان ونص قبل النشر");
      return;
    }
    store.addPost({ authorId: user.id, title, content, type, image: pendingImage });
    processActivity(user.id, "publish_post", {
      wordCount: wordCount(content),
      isFullWork: type === "chapter"
    });
    showToast("نُشر نصّك — أضيئت شعلة حماستك اليوم");
    visibleCount = PAGE_SIZE;
    root.querySelector("#post-title").value = "";
    root.querySelector("#post-content").value = "";
    pendingImage = null;
    root.querySelector("#image-upload-preview").innerHTML = `${icon("image", { size: 22 })}<span>أضف صورة تصاحب النص</span>`;
    paint();
  });
}
