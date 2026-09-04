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
    btn.classList.add("is-saving");btn.setAttribute("aria-busy","true");
    setTimeout(()=>{if(btn.isConnected){btn.classList.remove("is-saving");btn.removeAttribute("aria-busy");}},1400);
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
