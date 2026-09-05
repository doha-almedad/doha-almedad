/* =========================================================
   دوحة المداد — app.js
   نقطة الانطلاق والتشغيل الرئيسية للموقع بأكمله عند التحميل
   ========================================================= */

import "./db/store.js";
import { renderFooter } from "./components/footer.js";
import { initRouter, rerenderCurrentHeader } from "./router.js";

function boot(){
  renderFooter();
  initRouter();

  document.addEventListener("user:changed", () => {
    // إعادة تنفيذ المسار الحالي بعد تبديل المستخدم التجريبي
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  document.addEventListener("click",e=>{
    const btn=e.target.closest('button[id*="save"],button[id*="publish"],button[id*="approve"],button[id*="submit"]');
    if(!btn||btn.disabled)return;
    if(btn.dataset.saveLocked==="true"){
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    btn.dataset.saveLocked="true";
    btn.dataset.originalHtml = btn.innerHTML;
    btn.classList.add("is-saving");btn.setAttribute("aria-busy","true");
    // لا ينتهي التحميل إلا عند انتهاء العملية الفعلية، ثم تعود حالة الزر كاملة.
    const finish=()=>{if(btn.isConnected){delete btn.dataset.saveLocked;btn.classList.remove("is-saving");btn.removeAttribute("aria-busy");if(btn.dataset.originalHtml){btn.innerHTML=btn.dataset.originalHtml;delete btn.dataset.originalHtml;}}};
    document.addEventListener("operation:finished",finish,{once:true});
    setTimeout(finish,60000); // صمام أمان فقط عند حدوث خطأ غير متوقع.
  },true);

  // إصلاح مشكلة اختفاء الشريط العلوي أحياناً عند تدوير الجهاز (iPadOS/Safari)
  window.addEventListener("orientationchange", () => setTimeout(rerenderCurrentHeader, 60));
  window.addEventListener("resize", () => rerenderCurrentHeader());

  const loader = document.getElementById("ink-drop-loader");
  if(loader){
    setTimeout(() => loader.classList.add("hidden"), 220);
  }
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", boot);
}else{
  boot();
}

// Definitive async-action reset: every completed operation restores any active loading button.
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn || btn.disabled || btn.classList.contains("is-saving")) return;
  if (!/حفظ|إرسال|نشر|انضم|تعديل/.test(btn.textContent || "")) return;
  btn.dataset.loadingOriginalHtml = btn.innerHTML;
  queueMicrotask(() => {
    if (btn.isConnected && btn.classList.contains("is-saving")) {
      // The operation itself controls completion; safety only if no handler did.
      const done = () => {
        if (!btn.isConnected) return;
        btn.classList.remove("is-saving");
        btn.disabled = false;
        if (btn.dataset.loadingOriginalHtml) btn.innerHTML = btn.dataset.loadingOriginalHtml;
      };
      document.addEventListener("operation:finished", done, {once:true});
    }
  });
}, true);

document.addEventListener("operation:finished", () => {
  document.querySelectorAll("button.is-saving").forEach(btn => {
    btn.classList.remove("is-saving");
    btn.disabled = false;
    if (btn.dataset.loadingOriginalHtml) btn.innerHTML = btn.dataset.loadingOriginalHtml;
  });
});
