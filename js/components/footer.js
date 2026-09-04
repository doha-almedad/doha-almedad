/* =========================================================
   دوحة المداد — footer.js
   تذييل مختصر لا يشغل مساحة كبيرة من الشاشة
   ========================================================= */

export function renderFooter(){
  const mount = document.getElementById("app-footer");
  if(!mount) return;

  const year = new Date().getFullYear();

  mount.innerHTML = `
    <footer class="site-footer site-footer--slim">
      <div class="container site-footer__row">
        <span class="brand brand--sm">دوحة المِداد</span>
        <span class="text-muted">© ${year} — جميع الحقوق محفوظة</span>
      </div>
    </footer>
  `;
}
