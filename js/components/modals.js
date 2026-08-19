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
