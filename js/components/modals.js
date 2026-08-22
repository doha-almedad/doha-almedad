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
  setTimeout(() => el.remove(), 3200);
}

/* ---------------------------------------------------------
   نافذة معلومات المشارك — تُفتح عند الضغط على أيقونة/اسم أي
   عضو شارك في فعالية أو نشر في الكتابة/القراءة
   --------------------------------------------------------- */
export async function openParticipantModal(userId){
  const { store } = await import("../db/store.js");
  const { icon, initial, publicRoleLabel, parseSocialLink } = await import("./icons.js");
  const user = store.getUser(userId);
  if(!user) return;

  const badgeCount = Object.keys(user.badges || {}).length;
  const roleTag = publicRoleLabel(user.role);

  openModal(`
    <div class="modal-box__head"><h3>بطاقة العضو</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <div class="avatar avatar--lg">${initial(user.displayName)}</div>
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

export async function openCommentsModal(kind, itemId, onChange){
  const { store } = await import("../db/store.js");
  const { icon, initial } = await import("./icons.js");
  const currentUser = store.getCurrentUser();

  function itemOf(){
    return (kind === "post" ? store.getPosts() : store.getReviews()).find(i => i.id === itemId);
  }

  function commentRow(c, allComments){
    const author = store.getUser(c.userId);
    const liked = (c.likedBy || []).includes(currentUser.id);
    const replyToAuthor = c.replyToUserId ? store.getUser(c.replyToUserId) : null;
    return `
      <div class="comment-row" data-comment-id="${c.id}">
        <div class="avatar avatar--sm">${initial(author?.displayName)}</div>
        <div class="comment-row__body">
          <div class="comment-row__head"><b>${author?.displayName || "عضو"}</b><span>${timeAgoShort(c.date)}</span></div>
          ${replyToAuthor ? `<div class="comment-row__replyto">${icon("chevronLeft", { size: 11 })} رداً على ${replyToAuthor.displayName}</div>` : ""}
          <p>${c.text}</p>
          <div class="comment-row__actions">
            <button class="comment-row__reply ${liked ? "is-liked" : ""}" data-like-comment="${c.id}">${icon("heart", { size: 12 })} ${(c.likedBy||[]).length}</button>
            <button class="comment-row__reply" data-reply-to="${c.id}" data-reply-author="${author?.displayName || "عضو"}">رد</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderBody(){
    const item = itemOf();
    if(!item) return "";
    const comments = item.comments || [];
    const roots = comments.filter(c => !c.parentId);
    if(!roots.length){
      return `<div class="empty-state"><div class="empty-state__icon">${icon("comment", { size: 26 })}</div><p>لا تعليقات بعد — كن أول من يعلّق.</p></div>`;
    }
    return roots.map(c => `
      ${commentRow(c, comments)}
      <div class="comment-row__replies">
        ${comments.filter(r => r.parentId === c.id).map(r => commentRow(r, comments)).join("")}
      </div>
    `).join("");
  }

  openModal(`
    <div class="modal-box__head"><h3>التعليقات</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div id="comments-list" class="comments-list">${renderBody()}</div>
    <div class="field" style="margin-top:14px;">
      <label id="reply-context" style="display:none;color:var(--gold);"></label>
      <textarea id="comment-input" placeholder="اكتب تعليقاً..." style="min-height:70px;"></textarea>
    </div>
    <button class="btn btn-primary btn-sm" id="submit-comment-btn">${icon("send", { size: 15 })}<span>إرسال</span></button>
  `, {
    size: "lg",
    onMount(box){
      let replyToRootId = null;   // للتجميع البصري (دائماً تعليق جذر)
      let replyToCommentId = null; // للعرض "رداً على فلان"
      const list = box.querySelector("#comments-list");
      const ctxLabel = box.querySelector("#reply-context");

      function clearReplyState(){
        replyToRootId = null;
        replyToCommentId = null;
        ctxLabel.style.display = "none";
      }

      function bindRowButtons(){
        list.querySelectorAll("[data-reply-to]").forEach(btn => {
          btn.addEventListener("click", () => {
            const clickedId = btn.getAttribute("data-reply-to");
            const item = itemOf();
            const clicked = item.comments.find(c => c.id === clickedId);
            // التجميع دائماً تحت التعليق الجذر — لكن نعرض "رداً على" لصاحب التعليق الذي ضُغط عليه فعلياً
            replyToRootId = clicked.parentId || clicked.id;
            replyToCommentId = clickedId;
            ctxLabel.style.display = "block";
            ctxLabel.textContent = `الرد على ${btn.getAttribute("data-reply-author")}`;
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
      }
      bindRowButtons();

      box.querySelector("#submit-comment-btn").addEventListener("click", async () => {
        const { store } = await import("../db/store.js");
        const text = box.querySelector("#comment-input").value.trim();
        if(!text) return;
        const current = store.getCurrentUser();
        const replyToComment = replyToCommentId ? itemOf().comments.find(c => c.id === replyToCommentId) : null;
        store.addComment(kind, itemId, {
          userId: current.id,
          text,
          parentId: replyToRootId,
          replyToUserId: replyToComment ? replyToComment.userId : null
        });
        clearReplyState();
        box.querySelector("#comment-input").value = "";
        list.innerHTML = renderBody();
        bindRowButtons();
        if(typeof onChange === "function") onChange();
      });
    }
  });
}
