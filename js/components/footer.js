/* =========================================================
   دوحة المداد — footer.js
   التذييل السفلي للموقع مع الروابط والحقوق
   ========================================================= */

export function renderFooter(){
  const mount = document.getElementById("app-footer");
  if(!mount) return;

  const year = new Date().getFullYear();

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="site-footer__grid">
          <div style="max-width:320px;">
            <div class="brand" style="margin-bottom:10px;">🖋️ دوحة المداد</div>
            <p style="font-size:.88rem;">مساحة للكتّاب والقرّاء يلتقون فيها بالكلمة، ويحتفلون بكل خطوة في رحلتهم الأدبية.</p>
          </div>
          <div class="site-footer__cols">
            <div class="site-footer__col">
              <h4>المنصة</h4>
              <ul>
                <li><a href="#/events">الفعاليات</a></li>
                <li><a href="#/writing">الكتابة</a></li>
                <li><a href="#/reading">القراءة</a></li>
                <li><a href="#/articles">المقالات والدروس</a></li>
              </ul>
            </div>
            <div class="site-footer__col">
              <h4>مجتمعك</h4>
              <ul>
                <li><a href="#/leaderboard">لوحة المتصدرين</a></li>
                <li><a href="#/profile">ملفك الشخصي</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>© ${year} دوحة المداد — جميع الحقوق محفوظة</span>
          <span>صُنعت بحبٍّ للكلمة الأدبية</span>
        </div>
      </div>
    </footer>
  `;
}
