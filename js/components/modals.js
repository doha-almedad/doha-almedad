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
  const { icon, initial } = await import("./icons.js");
  const user = store.getUser(userId);
  if(!user) return;

  const badgeCount = Object.keys(user.badges || {}).length;

  openModal(`
    <div class="modal-box__head"><h3>بطاقة العضو</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <div class="avatar avatar--lg">${initial(user.displayName)}</div>
      <div>
        <div style="font-weight:700;font-size:1.05rem;">${user.displayName}</div>
        <div class="text-muted" style="font-size:.85rem;">${user.literaryTitle} · المستوى ${user.level}</div>
      </div>
    </div>
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

  function itemOf(){
    return (kind === "post" ? store.getPosts() : store.getReviews()).find(i => i.id === itemId);
  }

  function commentRow(c){
    const author = store.getUser(c.userId);
    return `
      <div class="comment-row" data-comment-id="${c.id}">
        <div class="avatar avatar--sm">${initial(author?.displayName)}</div>
        <div class="comment-row__body">
          <div class="comment-row__head"><b>${author?.displayName || "عضو"}</b><span>${timeAgoShort(c.date)}</span></div>
          <p>${c.text}</p>
          <button class="comment-row__reply" data-reply-to="${c.id}">رد</button>
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
      ${commentRow(c)}
      <div class="comment-row__replies">
        ${comments.filter(r => r.parentId === c.id).map(commentRow).join("")}
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
      let replyTo = null;
      const list = box.querySelector("#comments-list");
      const ctxLabel = box.querySelector("#reply-context");

      function bindReplyButtons(){
        list.querySelectorAll("[data-reply-to]").forEach(btn => {
          btn.addEventListener("click", () => {
            replyTo = btn.getAttribute("data-reply-to");
            ctxLabel.style.display = "block";
            ctxLabel.textContent = "الرد على تعليق ↑";
            box.querySelector("#comment-input").focus();
          });
        });
      }
      bindReplyButtons();

      box.querySelector("#submit-comment-btn").addEventListener("click", async () => {
        const { store } = await import("../db/store.js");
        const text = box.querySelector("#comment-input").value.trim();
        if(!text) return;
        const current = store.getCurrentUser();
        store.addComment(kind, itemId, { userId: current.id, text, parentId: replyTo });
        replyTo = null;
        ctxLabel.style.display = "none";
        box.querySelector("#comment-input").value = "";
        list.innerHTML = renderBody();
        bindReplyButtons();
        if(typeof onChange === "function") onChange();
      });
    }
  });
}
