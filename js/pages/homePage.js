/* =========================================================
   دوحة المداد — homePage.js
   1. الصفحة الرئيسية: الترحيب بالزوار وأبرز المستحدثات
   ========================================================= */

import { store } from "../db/store.js";
import { getLeaderboard } from "../services/rewardEngine.js";
import { icon, initial } from "../components/icons.js";

function excerpt(text, len = 110){
  return text.length > len ? text.slice(0, len).trim() + "…" : text;
}

export function renderHomePage(root){
  const user = store.getCurrentUser();
  const events = store.getEvents().slice(0, 3);
  const posts = store.getPosts().slice(0, 3);
  const articles = store.getArticles().slice(0, 1);
  const top3 = getLeaderboard().slice(0, 3);

  root.innerHTML = `
    <section class="hero">
      <div class="container">
        <span class="hero__eyebrow">أهلاً بك مجدداً، ${user.displayName}</span>
        <h1 class="hero__title">دوحة تظلّلها الكلمة، ويجتمع تحتها الكتّاب والقرّاء</h1>
        <p class="hero__lede">شارك نصوصك، سجّل قراءاتك، وخض التحديات الأدبية جنباً إلى جنب مع مجتمع يحتفي بكل خطوة تخطوها في رحلتك مع المداد.</p>
        <div class="hero__cta">
          <a href="#/writing" class="btn btn-outline">${icon("feather", { size: 17 })}<span>ابدأ الكتابة</span></a>
          <a href="#/reading" class="btn btn-outline">${icon("book", { size: 17 })}<span>ابدأ القراءة</span></a>
          <a href="#/events" class="btn btn-outline">${icon("calendar", { size: 17 })}<span>تصفّح الفعاليات</span></a>
        </div>
        <div class="grid grid-3 hero__stats-grid">
          <div class="card stat-box"><span class="stat-box__icon">${icon("users", { size: 18 })}</span><b>${store.getUsers().length}</b><span>عضو في الدوحة</span></div>
          <div class="card stat-box"><span class="stat-box__icon">${icon("calendar", { size: 18 })}</span><b>${store.getEvents().length}</b><span>فعالية أدبية</span></div>
          <div class="card stat-box"><span class="stat-box__icon">${icon("quill", { size: 18 })}</span><b>${store.getPosts().length + store.getReviews().length}</b><span>مساهمة منشورة</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">جارٍ الآن</span><h2>فعاليات مفتوحة للمشاركة</h2></div>
          <a href="#/events" class="btn btn-ghost">كل الفعاليات ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3">
          ${events.map(ev => `
            <a href="#/events/${ev.id}" class="card card--hover highlight-card">
              <div class="highlight-card__meta"><span class="badge-pill badge-pill--gold">${ev.participants.length} مشارك</span></div>
              <h3 class="highlight-card__title">${ev.title}</h3>
              <p>${excerpt(ev.description)}</p>
              <div class="highlight-card__foot"><span>حتى ${new Date(ev.endDate).toLocaleDateString("ar")}</span><span>التفاصيل ${icon("chevronLeft", { size: 13 })}</span></div>
            </a>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">حديثاً</span><h2>أحدث ما كُتب</h2></div>
          <a href="#/writing" class="btn btn-ghost">قسم الكتابة ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3">
          ${posts.length ? posts.map(p => `
            <div class="card highlight-card">
              <div class="highlight-card__meta"><span class="badge-pill">${store.getUser(p.authorId)?.displayName || "عضو"}</span></div>
              <h3 class="highlight-card__title">${p.title}</h3>
              <p>${excerpt(p.content)}</p>
            </div>
          `).join("") : `<div class="empty-state"><div class="empty-state__icon">${icon("feather", { size: 30 })}</div><p>لم يُنشر شيء بعد، كن أول من يكتب.</p></div>`}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="grid grid-2">
          <div class="card">
            <div class="section-head" style="margin-bottom:16px;">
              <h3 style="margin:0;display:flex;align-items:center;gap:8px;">${icon("chart", { size: 18, cls: "heading-icon" })} صدارة هذا الأسبوع</h3>
              <a href="#/leaderboard" class="btn btn-ghost btn-sm">الكل ${icon("chevronLeft", { size: 13 })}</a>
            </div>
            ${top3.map((u, i) => `
              <div class="leader-row ${i===0?"leader-row--top1":""}">
                <div class="leader-row__rank">${i+1}</div>
                <div class="leader-row__user"><div class="avatar avatar--sm">${initial(u.displayName)}</div>${u.displayName}</div>
                <div class="leader-row__xp">${u.xp} XP</div>
              </div>
            `).join("")}
          </div>
          ${articles.map(a => `
            <a href="#/articles" class="card card--hover highlight-card">
              <div class="highlight-card__meta"><span class="badge-pill badge-pill--ember">${a.category}</span></div>
              <h3 class="highlight-card__title">${icon("document", { size: 16, cls: "heading-icon" })} مقال مقترح: ${a.title}</h3>
              <p>${excerpt(a.excerpt)}</p>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}
