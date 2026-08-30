/* =========================================================
   دوحة المداد — homePage.js
   1. الصفحة الرئيسية: الترحيب بالزوار وأبرز المستحدثات
   ========================================================= */

import { store } from "../db/store.js";
import { getLeaderboard } from "../services/rewardEngine.js";
import { icon, initial, heroBookIllustration, arNum } from "../components/icons.js";

function excerpt(text, len = 110){
  return text.length > len ? text.slice(0, len).trim() + "…" : text;
}

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${arNum(Math.max(1,diffMin))} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${arNum(h)} س`;
  return `منذ ${arNum(Math.round(h/24))} يوم`;
}

function annualGoalsCard(){
  const year = new Date().getFullYear();
  const goal = store.getAnnualGoal(year);
  if(!goal) return "";
  const actual = store.computeYearActuals(year);
  const rows = [
    { label: "الكلمات", cur: actual.words, target: goal.words },
    { label: "الفعاليات", cur: actual.events, target: goal.events },
    { label: "الكتب المنشورة", cur: actual.booksPublished, target: goal.booksPublished },
    { label: "كتب القراءة", cur: actual.booksRead, target: goal.booksRead },
  ].filter(r => r.target);

  if(!rows.length) return "";

  return `
    <div class="card annual-goals-card">
      <h3 style="margin-bottom:16px;">${icon("target", { size: 18, cls: "heading-icon" })} أهداف السنة الحالية — ${arNum(year)}</h3>
      ${rows.map(r => {
        const pct = Math.min(100, Math.round((r.cur / r.target) * 100));
        return `
          <div class="goal-row">
            <div class="goal-row__labels"><span>${r.label}</span><span>${arNum(r.cur)} / ${arNum(r.target)}</span></div>
            <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

export function renderHomePage(root){
  const user = store.getCurrentUser();
  const events = store.getEvents().slice(0, 3);
  const posts = store.getPosts().slice(0, 3);
  const reviews = store.getReviews().slice(0, 3);
  const articles = store.getArticles().slice(0, 1);
  const top3 = getLeaderboard().slice(0, 3);

  const year = new Date().getFullYear();
  const goal = store.getAnnualGoal(year);
  const actual = store.computeYearActuals(year);
  const productionRatio = goal?.words ? Math.min(100, Math.round((actual.words / goal.words) * 100)) : 0;

  root.innerHTML = `
    <section class="hero">
      <div class="container hero__grid">
        <div class="hero__copy">
          <span class="hero__eyebrow">أهلاً بك مجدداً، ${user.displayName}</span>
          <h1 class="hero__title">دوحة تظلّلها الكلمة، ويجتمع تحتها الكتّاب والقرّاء</h1>
          <p class="hero__lede">شارك نصوصك، سجّل قراءاتك، وخض التحديات الأدبية جنباً إلى جنب مع مجتمعك.</p>
          <div class="hero__cta">
            <a href="#/writing" class="btn btn-outline">${icon("feather", { size: 17 })}<span>ابدأ الكتابة</span></a>
            <a href="#/reading" class="btn btn-outline">${icon("book", { size: 17 })}<span>ابدأ القراءة</span></a>
            <a href="#/events" class="btn btn-outline">${icon("calendar", { size: 17 })}<span>تصفّح الفعاليات</span></a>
          </div>
        </div>
        <div class="hero__art" aria-hidden="true">${heroBookIllustration({ size: 190 })}</div>
      </div>
      <div class="container">
        <div class="grid grid-4 hero__stats-grid">
          <div class="card stat-box stat-box--olive"><span class="stat-box__icon">${icon("users", { size: 18 })}</span><b>${arNum(store.getUsers().length)}</b><span>عضو في الدوحة</span></div>
          <div class="card stat-box stat-box--olive"><span class="stat-box__icon">${icon("chart", { size: 18 })}</span><b>${arNum(productionRatio)}%</b><span>نسبة الإنتاج التراكمي</span></div>
          <div class="card stat-box stat-box--olive"><span class="stat-box__icon">${icon("calendar", { size: 18 })}</span><b>${arNum(store.getEvents().length)}</b><span>فعالية أدبية</span></div>
          <div class="card stat-box stat-box--olive"><span class="stat-box__icon">${icon("quill", { size: 18 })}</span><b>${arNum(store.getPosts().length + store.getReviews().length)}</b><span>مساهمة منشورة</span></div>
        </div>
        ${annualGoalsCard()}
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
              <div class="highlight-card__meta"><span class="badge-pill badge-pill--gold">${arNum(ev.participants.length)} مشارك</span></div>
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
        <div class="grid grid-3" id="recent-posts-grid">
          ${posts.length ? posts.map(p => `
            <a href="#/writing/${p.id}" class="card card--hover highlight-card">
              <div class="highlight-card__meta"><span class="badge-pill">${store.getUser(p.authorId)?.displayName || "عضو"}</span></div>
              <h3 class="highlight-card__title">${p.title}</h3>
              <p>${excerpt(p.content)}</p>
              <div class="highlight-card__foot"><span>${timeAgo(p.date)}</span></div>
            </a>
          `).join("") : `<div class="empty-state"><div class="empty-state__icon">${icon("feather", { size: 30 })}</div><p>لم يُنشر شيء بعد، كن أول من يكتب.</p></div>`}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">حديثاً</span><h2>أحدث المراجعات</h2></div>
          <a href="#/reading" class="btn btn-ghost">قسم القراءة ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3" id="recent-reviews-grid">
          ${reviews.length ? reviews.map(r => `
            <a href="#/reading/${r.id}" class="card card--hover highlight-card">
              <div class="highlight-card__meta"><span class="badge-pill">${store.getUser(r.authorId)?.displayName || "عضو"}</span></div>
              <h3 class="highlight-card__title">${r.bookTitle}</h3>
              <p>${excerpt(r.content)}</p>
              <div class="highlight-card__foot"><span>${timeAgo(r.date)}</span></div>
            </a>
          `).join("") : `<div class="empty-state"><div class="empty-state__icon">${icon("book", { size: 30 })}</div><p>لا مراجعات بعد.</p></div>`}
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
              <div class="leader-row ${u.id === user.id ? "leader-row--me" : ""}">
                <div class="leader-row__rank">${arNum(i+1)}</div>
                <div class="leader-row__user"><div class="avatar avatar--sm">${initial(u.displayName)}</div>${u.displayName}</div>
                <div class="leader-row__xp">${arNum(u.xp)} XP</div>
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
