/* =========================================================
   دوحة المداد — homePage.js
   1. الصفحة الرئيسية: الترحيب بالزوار وأبرز المستحدثات
   ========================================================= */

import { store } from "../db/store.js";
import { icon, arNum } from "../components/icons.js";

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

function personalGoalsCard(user){
  const goals = store.getPersonalGoals(user.id);
  const sections = goals.sections || [];
  const names = { writing:"الكتابة", reading:"القراءة", events:"الفعاليات", articles:"المقالات" };
  const progress = section => {
    if(section==="writing"){const target=goals.writing?.words||goals.writing?.count||0,total=goals.writing?.words?user.stats.wordsWritten:store.getPosts().filter(p=>p.authorId===user.id).length,current=Math.max(0,total-(goals.baseline?.[goals.writing?.words?"words":"posts"]||0));return target?Math.min(100,Math.round(current/target*100)):0;}
    if(section==="reading"){const target=goals.reading?.count||0,titles=goals.reading?.titles||[],library=store.getPersonalLibrary(user.id);const current=titles.length?new Set(library.filter(b=>titles.some(t=>t.trim().toLocaleLowerCase()===b.title.trim().toLocaleLowerCase())).map(b=>b.title.trim().toLocaleLowerCase())).size:Math.max(0,library.length-(goals.baseline?.personalBooks||0));return target?Math.min(100,Math.round(current/target*100)):0;}
    if(section==="events"){const ids=goals.events||[],joined=ids.filter(id=>store.getEvent(id)?.participants?.includes(user.id)).length;return ids.length?Math.round(joined/ids.length*100):0;}
    const ids=goals.articles||[],read=ids.filter(id=>(user.readArticleIds||[]).includes(id)).length;return ids.length?Math.round(read/ids.length*100):0;
  };
  const detail = section => {
    if(section === "writing") return `${arNum(goals.writing?.count||0)} نصوص · ${arNum(goals.writing?.words||0)} كلمة · ${goals.writing?.type||"متنوع"}${goals.writing?.deadline?` · حتى ${goals.writing.deadline}`:""}`;
    if(section === "reading") {
      const titles = goals.reading?.titles || goals.reading?.books?.map(book => book.title).filter(Boolean) || [];
      return `${arNum(goals.reading?.count||0)} كتب${goals.reading?.deadline?` · حتى ${goals.reading.deadline}`:""}${titles.length?` · ${titles.join("، ")}`:""}`;
    }
    if(section === "events") return (goals.events||[]).map(id=>store.getEvent(id)?.title).filter(Boolean).join("، ") || "لم تُحدّد فعالية بعد";
    return (goals.articles||[]).map(id=>store.getArticle(id)?.title).filter(Boolean).join("، ") || "لم تُحدّد مقالة بعد";
  };
  return `<div class="card annual-goals-card home-personal-goals">
    <div class="home-personal-goals__head"><h3>${icon("target",{size:18,cls:"heading-icon"})} أهدافي</h3><a href="#/profile" class="btn btn-ghost btn-sm">إدارة الأهداف</a></div>
    ${sections.length ? `<div class="home-personal-goals__grid">${sections.map(section=>{const pct=progress(section);return `<div class="home-personal-goal"><b>${names[section]}</b><span>${detail(section)}</span><div class="home-personal-goal__progress"><i style="width:${pct}%"></i></div><small>${arNum(pct)}٪ من الهدف</small></div>`;}).join("")}</div>` : `<p class="text-muted">لم تضف أهدافًا شخصية بعد. يمكنك إنشاؤها من «مساحتي» في ملفك الشخصي.</p>`}
  </div>`;
}

export function renderHomePage(root){
  const user = store.getCurrentUser();
  const events = store.getEvents().slice(0, 3);
  const posts = store.getPosts().slice(0, 3);
  const reviews = store.getReviews().slice(0, 3);
  const articles = store.getArticles().slice(0, 3);

  root.innerHTML = `
    <section class="hero">
      <div class="container hero__grid">
        <div class="hero__copy">
          <span class="hero__eyebrow">أهلًا بك مجددًا، ${user.displayName}</span>
          <h1 class="hero__title">دوحة تظلّلها الكلمة، ويجتمع تحتها الكتّاب والقرّاء</h1>
          <p class="hero__lede">شارك نصوصك، سجّل قراءاتك، وخض التحديات الأدبية جنبًا إلى جنب مع مجتمعك.</p>
          <div class="hero__cta">
            <a href="#/writing" class="btn btn-outline">${icon("feather", { size: 17 })}<span>ابدأ الكتابة</span></a>
            <a href="#/reading" class="btn btn-outline">${icon("book", { size: 17 })}<span>ابدأ القراءة</span></a>
            <a href="#/events" class="btn btn-outline">${icon("calendar", { size: 17 })}<span>تصفّح الفعاليات</span></a>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="grid grid-3 hero__stats-grid">
          <div class="card stat-box stat-box--winkle"><span class="stat-box__icon">${icon("users", { size: 17 })}</span><b>${arNum(store.getUsers().length)}</b><span>عضو في الدوحة</span></div>
          <div class="card stat-box stat-box--winkle"><span class="stat-box__icon">${icon("calendar", { size: 17 })}</span><b>${arNum(store.getEvents().length)}</b><span>فعالية أدبية</span></div>
          <div class="card stat-box stat-box--winkle"><span class="stat-box__icon">${icon("quill", { size: 17 })}</span><b>${arNum(store.getPosts().length + store.getReviews().length)}</b><span>مساهمة منشورة</span></div>
        </div>
        ${personalGoalsCard(user)}
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
          <div><span class="eyebrow">حديثًا</span><h2>أحدث ما كُتب</h2></div>
          <a href="#/writing" class="btn btn-ghost">قسم الكتابة ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3" id="recent-posts-grid">
          ${posts.length ? posts.map(p => `
            <a href="#/writing/${p.id}" class="card card--hover highlight-card home-update-card">
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
          <div><span class="eyebrow">حديثًا</span><h2>أحدث المراجعات</h2></div>
          <a href="#/reading" class="btn btn-ghost">قسم القراءة ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3" id="recent-reviews-grid">
          ${reviews.length ? reviews.map(r => `
            <a href="#/reading/${r.id}" class="card card--hover highlight-card home-update-card">
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
        <div class="section-head">
          <div><span class="eyebrow">حديثًا</span><h2>أحدث المقالات والملخصات</h2></div>
          <a href="#/articles" class="btn btn-ghost">قسم المقالات ${icon("chevronLeft", { size: 15 })}</a>
        </div>
        <div class="grid grid-3" id="recent-articles-grid">
          ${articles.map(a => `
            <a href="#/articles/${a.id}" class="card card--hover highlight-card home-update-card">
              <div class="highlight-card__meta"><span class="badge-pill badge-pill--ember">${a.category}</span></div>
              <h3 class="highlight-card__title">${icon("document", { size: 16, cls: "heading-icon" })} ${a.title}</h3>
              <p>${excerpt(a.excerpt)}</p>
            </a>
          `).join("") || `<div class="empty-state"><div class="empty-state__icon">${icon("document", { size: 30 })}</div><p>لا توجد مقالات أو ملخصات بعد.</p></div>`}
        </div>
      </div>
    </section>
  `;

}
