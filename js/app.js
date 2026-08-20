/* =========================================================
   دوحة المداد — app.js
   نقطة الانطلاق والتشغيل الرئيسية للموقع بأكمله عند التحميل
   ========================================================= */

import "./db/store.js";
import { initRouter, rerenderCurrentHeader } from "./router.js";

function boot(){
  initRouter();

  document.addEventListener("user:changed", () => {
    // إعادة تنفيذ المسار الحالي بعد تبديل المستخدم التجريبي
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

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
