/* =========================================================
   دوحة المداد — app.js
   نقطة الانطلاق والتشغيل الرئيسية للموقع بأكمله عند التحميل
   ========================================================= */

import "./db/store.js";
import { renderFooter } from "./components/footer.js";
import { initRouter } from "./router.js";

function boot(){
  renderFooter();
  initRouter();

  document.addEventListener("user:changed", () => {
    // إعادة تنفيذ المسار الحالي بعد تبديل المستخدم التجريبي
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

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
