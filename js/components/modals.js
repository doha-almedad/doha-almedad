/* =========================================================
   دوحة المداد — modals.js
   النوافذ المنبثقة (الإشعارات، الإعدادات، وتفاصيل البطاقات)
   نافذة مستقلة وسريعة تفتح فوق الصفحة الحالية دون مغادرتها
   ========================================================= */

let activeCloseHandler = null;

export function openModal(innerHtml, { onMount, size } = {}){
  closeModal(); // نافذة واحدة في كل مرة

  const root = document.getElementById("modal-root");
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" style="${size === "lg" ? "max-width:720px" : ""}">${innerHtml}</div>`;
  root.appendChild(overlay);

  const box = overlay.querySelector(".modal-box");

  function onKeydown(e){ if(e.key === "Escape") closeModal(); }
  function onOverlayClick(e){ if(e.target === overlay) closeModal(); }

  overlay.addEventListener("click", onOverlayClick);
  document.addEventListener("keydown", onKeydown);
  overlay.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", closeModal));

  activeCloseHandler = () => {
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };

  if(typeof onMount === "function") onMount(box);

  // تفعيل أي زر إغلاق أُضيف داخل onMount أيضاً
  box.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", closeModal));

  // نقل التركيز إلى النافذة لإتاحة الوصول
  box.setAttribute("tabindex", "-1");
  box.focus();

  return overlay;
}

export function closeModal(){
  if(activeCloseHandler){
    activeCloseHandler();
    activeCloseHandler = null;
  }
}

export function showToast(message){
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  root.appendChild(el);
  if(!String(message).startsWith("جارٍ")) document.dispatchEvent(new CustomEvent("operation:finished"));
  setTimeout(() => el.remove(), 3200);
}

/* ---------------------------------------------------------
   نافذة معلومات المشارك — تُفتح عند الضغط على أيقونة/اسم أي
   عضو شارك في فعالية أو نشر في الكتابة/القراءة
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   نافذة عرض منشور أو مراجعة كاملة (تُستخدم من الصفحة الرئيسية)
   --------------------------------------------------------- */
export async function openPostViewModal(postId){
  const { store } = await import("../db/store.js");
  const { icon, initial } = await import("./icons.js");
  const { renderCarousel, bindCarousels } = await import("./carousel.js");
  const p = store.getPosts().find(x => x.id === postId);
  if(!p) return;
  const author = store.getUser(p.authorId);
  const images = p.images || (p.image ? [p.image] : []);
  openModal(`
    <div class="modal-box__head"><h3>${p.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="highlight-card__meta" style="margin-bottom:12px;">
      <span class="badge-pill">${author?.displayName || "عضو"}</span>
    </div>
    ${renderCarousel(images)}
    <p style="white-space:pre-line;">${p.content}</p>
  `, { size: "lg", onMount(box){ bindCarousels(box); } });
}

export async function openReviewViewModal(reviewId){
  const { store } = await import("../db/store.js");
  const { icon } = await import("./icons.js");
  const { renderCarousel, bindCarousels } = await import("./carousel.js");
  const r = store.getReviews().find(x => x.id === reviewId);
  if(!r) return;
  const author = store.getUser(r.authorId);
  const images = r.images || (r.image ? [r.image] : []);
  openModal(`
    <div class="modal-box__head"><h3>${r.bookTitle}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="highlight-card__meta" style="margin-bottom:12px;">
      <span class="badge-pill">${author?.displayName || "عضو"}</span>
      <span class="rating-stars">${Array.from({length:5},(_, i) => icon("star", { size: 13, cls: i < r.rating ? "star-filled" : "star-empty" })).join("")}</span>
    </div>
    ${renderCarousel(images)}
    <p style="white-space:pre-line;">${r.content}</p>
  `, { size: "lg", onMount(box){ bindCarousels(box); } });
}

export async function openArticleViewModal(articleId){
  const { store } = await import("../db/store.js");
  const { icon } = await import("./icons.js");
  const { renderCarousel, bindCarousels } = await import("./carousel.js");
  const a = store.getArticles().find(x => x.id === articleId);
  if(!a) return;
  const author = store.getUser(a.author);
  const images = a.images || (a.image ? [a.image] : []);
  openModal(`
    <div class="modal-box__head"><h3>${a.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="highlight-card__meta" style="margin-bottom:12px;">
      <span class="badge-pill badge-pill--ember">${a.category}</span>
      <span class="badge-pill">${author?.displayName || "كاتب"}</span>
    </div>
    ${renderCarousel(images)}
    <p style="white-space:pre-line;">${a.content}</p>
  `, { size: "lg", onMount(box){ bindCarousels(box); } });
}

export async function openParticipantModal(userId){
  const { store } = await import("../db/store.js");
  const { icon, initial, publicRoleLabel, parseSocialLink, avatarHtml } = await import("./icons.js");
  const user = store.getUser(userId);
  if(!user) return;

  const badgeCount = Object.keys(user.badges || {}).length;
  const roleTag = publicRoleLabel(user.role);

  openModal(`
    <div class="modal-box__head"><h3>بطاقة العضو</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <div class="avatar avatar--lg">${avatarHtml(user)}</div>
      <div>
        <div style="font-weight:700;font-size:1.05rem;">${user.displayName}</div>
        <div class="text-muted" style="font-size:.85rem;">${roleTag ? `<span class="badge-pill badge-pill--sage" style="margin-inline-end:6px;">${roleTag}</span>` : ""}المستوى ${user.level}</div>
      </div>
    </div>
    ${user.bio ? `<p style="margin-bottom:14px;">${user.bio}</p>` : ""}
    ${user.socialUrl ? (() => {
      const s = parseSocialLink(user.socialUrl);
      return s ? `<a href="${s.url}" target="_blank" rel="noopener" class="badge-pill" style="margin-bottom:14px;display:inline-flex;align-items:center;gap:6px;">${icon(s.platform, { size: 12 })}@${s.handle}</a>` : "";
    })() : ""}
    <div class="grid grid-3" style="margin-bottom:16px;">
      <div class="card stat-box" style="padding:12px;"><b style="font-size:1.1rem;">${user.xp}</b><span>نقطة خبرة</span></div>
      <div class="card stat-box" style="padding:12px;"><b style="font-size:1.1rem;">${badgeCount}</b><span>وسام</span></div>
      <div class="card stat-box" style="padding:12px;"><b style="font-size:1.1rem;">${user.streak || 0}</b><span>يوم نشاط متتالٍ</span></div>
    </div>
    <a href="#/profile/${user.id}" class="btn btn-outline btn-block" data-close>عرض الملف الشخصي الكامل</a>
  `);
}

/** يربط كل عناصر [data-user-id].participant-link داخل حاوية بفتح بطاقة العضو */
export function bindParticipantLinks(container){
  container.querySelectorAll(".participant-link[data-user-id]").forEach(el => {
    el.classList.add("is-clickable");
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openParticipantModal(el.getAttribute("data-user-id"));
    });
  });
}

/* ---------------------------------------------------------
   نافذة التعليقات — عرض تعليقات منشور/مراجعة، كتابة تعليق،
   والرد على تعليق قائم (مستوى واحد من الردود)
   --------------------------------------------------------- */
function timeAgoShort(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 1) return "الآن";
  if(diffMin < 60) return `منذ ${diffMin} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h/24)} يوم`;
}

const REPLIES_PAGE_SIZE = 5;
let repliesShownByRoot = {}; // { rootId: count } — إعادة تصفير عند فتح نافذة جديدة

export async function openCommentsModal(kind, itemId, onChange){
  const { store } = await import("../db/store.js");
  const { icon, initial, avatarHtml } = await import("./icons.js");
  const currentUser = store.getCurrentUser();
  repliesShownByRoot = {};

  function itemOf(){
    return (kind === "post" ? store.getPosts() : store.getReviews()).find(i => i.id === itemId);
  }

  function commentRow(c){
    const author = store.getUser(c.userId);
    const liked = (c.likedBy || []).includes(currentUser.id);
    const canEdit = c.userId === currentUser.id || currentUser.role === "owner" || currentUser.role === "moderator";
    let replyToAuthor = null;
    if(c.parentCommentId){
      const parent = itemOf().comments.find(x => x.id === c.parentCommentId);
      replyToAuthor = parent ? store.getUser(parent.userId) : null;
    }
    return `
      <div class="comment-row ${c.parentCommentId ? "comment-row--reply" : ""}" id="comment-${c.id}" data-comment-id="${c.id}">
        <div class="avatar avatar--sm">${avatarHtml(author)}</div>
        <div class="comment-row__body">
          <div class="comment-row__head"><b>${author?.displayName || "عضو"}</b><span>${timeAgoShort(c.date)}${c.editedAt ? ` · تم التعديل ${timeAgoShort(c.editedAt)}` : ""}</span></div>
          ${replyToAuthor ? `<button type="button" class="comment-row__replyto" data-goto-comment="${c.parentCommentId}">${icon("chevronLeft", { size: 11 })}<span>رد على <b class="comment-mention">@${replyToAuthor.username || replyToAuthor.displayName}</b></span></button>` : ""}
          <p>${c.text}</p>
          <div class="comment-row__actions">
            <button class="comment-row__reply ${liked ? "is-liked" : ""}" data-like-comment="${c.id}">${icon("heart", { size: 12 })} ${(c.likedBy||[]).length}</button>
            <button class="comment-row__reply" data-reply-to="${c.id}" data-reply-author="${author?.username || author?.displayName || "عضو"}">رد</button>
            ${canEdit ? `<button class="comment-row__reply" data-edit-comment="${c.id}">${icon("feather", { size:11 })} تعديل</button>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  /** يبني كل خيوط الردود (Threads) — كل تعليق جذري + ردوده المسطّحة بأي عمق، مع تحميل تدريجي */
  function renderBody(){
    const item = itemOf();
    if(!item) return "";
    const comments = item.comments || [];
    const roots = comments.filter(c => !c.parentCommentId);
    if(!roots.length){
      return `<div class="empty-state"><div class="empty-state__icon">${icon("comment", { size: 26 })}</div><p>لا تعليقات بعد — كن أول من يعلّق.</p></div>`;
    }
    return roots.map(root => {
      const allReplies = comments
        .filter(c => c.rootCommentId === root.id && c.id !== root.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const shown = repliesShownByRoot[root.id] || REPLIES_PAGE_SIZE;
      const visibleReplies = allReplies.slice(0, shown);
      const remaining = allReplies.length - visibleReplies.length;

      return `
        <div class="comment-thread" data-root-id="${root.id}">
          ${commentRow(root)}
          <div class="comment-row__replies">
            ${visibleReplies.map(commentRow).join("")}
            ${remaining > 0 ? `<button class="btn btn-ghost btn-sm" data-load-more-replies="${root.id}">عرض ${Math.min(remaining, REPLIES_PAGE_SIZE)} ردود إضافية (من أصل ${remaining})</button>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  openModal(`
    <div class="modal-box__head"><h3>التعليقات</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div id="comments-list" class="comments-list">${renderBody()}</div>
    <div class="field" style="margin-top:14px;">
      <div id="reply-context" class="reply-context-bar" style="display:none;">
        <span id="reply-context-text"></span>
        <button type="button" id="cancel-reply" aria-label="إلغاء الرد">${icon("close", { size: 13 })}</button>
      </div>
      <textarea id="comment-input" placeholder="اكتب تعليقًا..." style="min-height:70px;"></textarea>
    </div>
    <button class="btn btn-primary btn-sm" id="submit-comment-btn">${icon("send", { size: 15 })}<span>إرسال</span></button>
  `, {
    size: "lg",
    onMount(box){
      let replyToCommentId = null; // الأب المباشر الحقيقي — لا نفرضه على الجذر أبداً
      const list = box.querySelector("#comments-list");
      const ctxLabel = box.querySelector("#reply-context");
      const ctxText = box.querySelector("#reply-context-text");

      function clearReplyState(){
        replyToCommentId = null;
        ctxLabel.style.display = "none";
        ctxText.textContent = "";
      }

      function highlightComment(commentId){
        const el = list.querySelector(`#comment-${commentId}`);
        if(!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("is-highlighted");
        setTimeout(() => el.classList.remove("is-highlighted"), 1500);
      }

      function bindRowButtons(){
        list.querySelectorAll("[data-edit-comment]").forEach(btn => {
          btn.addEventListener("click", () => {
            const commentId = btn.getAttribute("data-edit-comment");
            const item = itemOf();
            const comment = item?.comments?.find(c => c.id === commentId);
            const row = btn.closest(".comment-row");
            const paragraph = row?.querySelector(".comment-row__body > p");
            if(!comment || !paragraph) return;
            const editor = document.createElement("div");
            editor.className = "comment-inline-editor";
            editor.innerHTML = `<textarea></textarea><div><button class="btn btn-ghost btn-sm" data-cancel-comment-edit>إلغاء</button><button class="btn btn-primary btn-sm" data-save-comment-edit>حفظ</button></div>`;
            editor.querySelector("textarea").value = comment.text;
            paragraph.replaceWith(editor);
            editor.querySelector("textarea").focus();
            editor.querySelector("[data-cancel-comment-edit]").onclick = () => { list.innerHTML = renderBody(); bindRowButtons(); };
            editor.querySelector("[data-save-comment-edit]").onclick = () => {
              const value = editor.querySelector("textarea").value.trim();
              if(!value) return;
              store.updateComment(kind, itemId, commentId, value, currentUser.id);
              list.innerHTML = renderBody(); bindRowButtons();
              if(typeof onChange === "function") onChange();
            };
          });
        });
        list.querySelectorAll("[data-reply-to]").forEach(btn => {
          btn.addEventListener("click", () => {
            replyToCommentId = btn.getAttribute("data-reply-to");
            ctxLabel.style.display = "flex";
            ctxText.textContent = `الرد على @${btn.getAttribute("data-reply-author")}`;
            box.querySelector("#comment-input").focus();
          });
        });
        list.querySelectorAll("[data-like-comment]").forEach(btn => {
          btn.addEventListener("click", () => {
            store.toggleCommentLike(kind, itemId, btn.getAttribute("data-like-comment"), currentUser.id);
            list.innerHTML = renderBody();
            bindRowButtons();
          });
        });
        list.querySelectorAll("[data-goto-comment]").forEach(btn => {
          btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-goto-comment");
            // إن كان الهدف مخفياً بسبب التحميل التدريجي، أظهر كل ردود نفس الخيط أولاً
            const thread = btn.closest(".comment-thread");
            const rootId = thread?.getAttribute("data-root-id");
            if(rootId && !list.querySelector(`#comment-${targetId}`)){
              const item = itemOf();
              const totalInThread = item.comments.filter(c => c.rootCommentId === rootId && c.id !== rootId).length;
              repliesShownByRoot[rootId] = totalInThread;
              list.innerHTML = renderBody();
              bindRowButtons();
            }
            highlightComment(targetId);
          });
        });
        list.querySelectorAll("[data-load-more-replies]").forEach(btn => {
          btn.addEventListener("click", () => {
            const rootId = btn.getAttribute("data-load-more-replies");
            repliesShownByRoot[rootId] = (repliesShownByRoot[rootId] || REPLIES_PAGE_SIZE) + REPLIES_PAGE_SIZE;
            list.innerHTML = renderBody();
            bindRowButtons();
          });
        });
      }
      bindRowButtons();
      box.querySelector("#cancel-reply").addEventListener("click", clearReplyState);

      box.querySelector("#submit-comment-btn").addEventListener("click", async () => {
        const { store } = await import("../db/store.js");
        const text = box.querySelector("#comment-input").value.trim();
        if(!text) return;
        const current = store.getCurrentUser();
        const newComment = store.addComment(kind, itemId, {
          userId: current.id,
          text,
          parentCommentId: replyToCommentId
        });
        // تأكّد من ظهور الرد الجديد فوراً حتى لو كان الخيط مطويّاً
        if(newComment?.rootCommentId){
          const item = itemOf();
          const totalInThread = item.comments.filter(c => c.rootCommentId === newComment.rootCommentId && c.id !== newComment.rootCommentId).length;
          repliesShownByRoot[newComment.rootCommentId] = totalInThread;
        }
        clearReplyState();
        box.querySelector("#comment-input").value = "";
        list.innerHTML = renderBody();
        bindRowButtons();
        if(typeof onChange === "function") onChange();
      });
    }
  });
}
