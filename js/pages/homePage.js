/* =========================================================
   دوحة المداد — homePage.js
   الرئيسية الجديدة: الدوحة → الرحلة الشخصية → الأهداف → ما يحدث الآن
   ========================================================= */

import { store } from "../db/store.js";
import { icon, arNum } from "../components/icons.js";

function excerpt(text="", len=110){ return text.length>len ? text.slice(0,len).trim()+"…" : text; }
function timeAgo(iso){ const m=Math.round((Date.now()-new Date(iso).getTime())/60000); if(m<60)return `منذ ${arNum(Math.max(1,m))} د`; const h=Math.round(m/60); if(h<24)return `منذ ${arNum(h)} س`; return `منذ ${arNum(Math.round(h/24))} يوم`; }

function personalGoalsCard(user){
  const goals=store.getPersonalGoals(user.id), sections=goals.sections||[];
  const names={writing:"الكتابة",reading:"القراءة",events:"الفعاليات",articles:"المقالات"};
  const progress=section=>{
    if(section==="writing"){const target=goals.writing?.words||goals.writing?.count||0,total=goals.writing?.words?user.stats.wordsWritten:store.getPosts().filter(p=>p.authorId===user.id).length,current=Math.max(0,total-(goals.baseline?.[goals.writing?.words?"words":"posts"]||0));return target?Math.min(100,Math.round(current/target*100)):0;}
    if(section==="reading"){const target=goals.reading?.count||0,titles=goals.reading?.titles||[],library=store.getPersonalLibrary(user.id),current=titles.length?new Set(library.filter(b=>titles.some(t=>t.trim().toLocaleLowerCase()===b.title.trim().toLocaleLowerCase())).map(b=>b.title.trim().toLocaleLowerCase())).size:Math.max(0,library.length-(goals.baseline?.personalBooks||0));return target?Math.min(100,Math.round(current/target*100)):0;}
    if(section==="events"){const ids=goals.events||[],joined=ids.filter(id=>store.getEvent(id)?.participants?.includes(user.id)).length;return ids.length?Math.round(joined/ids.length*100):0;}
    const ids=goals.articles||[],read=ids.filter(id=>(user.readArticleIds||[]).includes(id)).length;return ids.length?Math.round(read/ids.length*100):0;
  };
  const detail=section=>{
    if(section==="writing")return `${arNum(goals.writing?.count||0)} نصوص · ${arNum(goals.writing?.words||0)} كلمة · ${goals.writing?.type||"متنوع"}${goals.writing?.deadline?` · حتى ${goals.writing.deadline}`:""}`;
    if(section==="reading"){const titles=goals.reading?.titles||goals.reading?.books?.map(b=>b.title).filter(Boolean)||[];return `${arNum(goals.reading?.count||0)} كتب${goals.reading?.deadline?` · حتى ${goals.reading.deadline}`:""}${titles.length?` · ${titles.join("، ")}`:""}`;}
    if(section==="events")return (goals.events||[]).map(id=>store.getEvent(id)?.title).filter(Boolean).join("، ")||"لم تُحدّد فعالية بعد";
    return (goals.articles||[]).map(id=>store.getArticle(id)?.title).filter(Boolean).join("، ")||"لم تُحدّد مقالة بعد";
  };
  return `<section class="section section--tight home-goals-section reveal-on-scroll"><div class="container"><div class="section-head"><div><span class="eyebrow">ما اخترت أن تنجزه</span><h2>أهدافي</h2></div><a href="#/profile" class="btn btn-ghost">إدارة الأهداف</a></div><div class="card annual-goals-card home-personal-goals">${sections.length?`<div class="home-personal-goals__grid">${sections.map(s=>{const pct=progress(s);return `<div class="home-personal-goal"><b>${names[s]}</b><span>${detail(s)}</span><div class="home-personal-goal__progress"><i style="width:${pct}%"></i></div><small>${arNum(pct)}٪ من الهدف</small></div>`}).join("")}</div>`:`<p class="text-muted">لم تضف أهدافًا شخصية بعد. يمكنك إنشاؤها من «مساحتي» في ملفك الشخصي.</p>`}</div></div></section>`;
}

function journeyCard(user){
  const prefs=store.getJourneyPreferences?.(user.id);
  if(!prefs?.roles?.length){
    return `<div class="journey-welcome card"><span class="journey-welcome__mark">${icon("compass",{size:26})}</span><div><h3>لنرسم رحلتك في الدوحة</h3><p>أخبرنا بما تحب: القراءة، الكتابة، الفعاليات، والأنواع الأدبية التي تجذبك. سنبني لك مسارًا يناسبك دون أن نفرض عليك طريقًا واحدًا.</p></div><button class="btn btn-primary" id="start-journey-survey">ابدأ الاستفتاء</button></div>`;
  }
  const role=prefs.roles[0], genre=prefs.genres?.[0]||"الأدب";
  const cards=[];
  if(prefs.roles.includes("reader")) cards.push({k:"خطوتك الآن",t:`اكتشف قراءة في ${genre}`,d:"ابدأ بما يناسب ذائقتك، ثم سجّل ما يلفت انتباهك في مكتبتك.",href:"#/reading",ic:"book"});
  if(prefs.roles.includes("writer")) cards.push({k:"مساحتك",t:"امنح فكرةً وقتها على الورق",d:"افتح مساحة الكتابة أو عد إلى إحدى مسوداتك الخاصة.",href:"#/writing",ic:"feather"});
  if(prefs.roles.includes("events")) cards.push({k:"في الدوحة الآن",t:"فعالية قد تناسب رحلتك",d:"استكشف الفعاليات المفتوحة واختر ما يضيف إلى تجربتك.",href:"#/events",ic:"calendar"});
  if(!cards.length) cards.push({k:"قد يعجبك",t:"اكتشف شيئًا جديدًا اليوم",d:"تجوّل بين أحدث ما يقرأه ويكتبه أعضاء الدوحة.",href:"#/articles",ic:"sparkles"});
  cards.push({k:"فاجئني",t:"اخرج قليلًا من مسارك المعتاد",d:"دع الدوحة تقترح عليك بابًا أدبيًا مختلفًا.",href:"#/articles",ic:"sparkles"});
  return `<div class="journey-track">${cards.slice(0,4).map((c,i)=>`<a href="${c.href}" class="card journey-card reveal-on-scroll" style="--reveal-delay:${i*90}ms"><span class="journey-card__step">${arNum(i+1)}</span><span class="journey-card__icon">${icon(c.ic,{size:20})}</span><small>${c.k}</small><h3>${c.t}</h3><p>${c.d}</p></a>`).join("")}</div><button class="btn btn-ghost journey-edit" id="edit-journey-survey">تعديل اهتمامات رحلتي</button>`;
}

function journeySurvey(user){
  const old=store.getJourneyPreferences?.(user.id)||{};
  const roles=[['reader','قارئ'],['writer','كاتب'],['events','محب الفعاليات'],['discussion','محب النقاشات']];
  const genres=['خيال علمي','فانتازيا','روايات','قصة قصيرة','شعر','أدب كلاسيكي','فلسفة','تاريخ','متنوع'];
  const goals=['اكتشاف كتب','بناء عادة قراءة','تطوير الكتابة','مشاركة النصوص','التفاعل مع المجتمع'];
  const checked=(arr,v)=>(arr||[]).includes(v)?'checked':'';
  const overlay=document.createElement('div'); overlay.className='modal-overlay';
  overlay.innerHTML=`<div class="modal-box journey-survey-modal"><button class="modal-close" aria-label="إغلاق">×</button><span class="eyebrow">رحلتك تخصّك</span><h2>ما الذي يجذبك إلى الدوحة؟</h2><p class="text-muted">اختر ما يناسبك فقط، ويمكنك تغييره متى شئت.</p><div class="journey-survey-group"><b>كيف تحب أن تقضي وقتك؟</b><div class="choice-chips">${roles.map(([v,l])=>`<label><input type="checkbox" name="jr-role" value="${v}" ${checked(old.roles,v)}><span>${l}</span></label>`).join('')}</div></div><div class="journey-survey-group"><b>ما الأنواع التي تجذبك؟</b><div class="choice-chips">${genres.map(v=>`<label><input type="checkbox" name="jr-genre" value="${v}" ${checked(old.genres,v)}><span>${v}</span></label>`).join('')}</div></div><div class="journey-survey-group"><b>ما الذي تريد الوصول إليه؟</b><div class="choice-chips">${goals.map(v=>`<label><input type="checkbox" name="jr-goal" value="${v}" ${checked(old.goals,v)}><span>${v}</span></label>`).join('')}</div></div><button class="btn btn-primary btn-block" id="save-journey-survey">ارسم رحلتي</button></div>`;
  document.body.appendChild(overlay); const close=()=>overlay.remove(); overlay.querySelector('.modal-close').onclick=close; overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  overlay.querySelector('#save-journey-survey').onclick=()=>{const val=n=>[...overlay.querySelectorAll(`input[name="${n}"]:checked`)].map(x=>x.value); const data={roles:val('jr-role'),genres:val('jr-genre'),goals:val('jr-goal')}; if(!data.roles.length)return; store.setJourneyPreferences(user.id,data); close(); renderHomePage(document.querySelector('#app'));};
}

export function renderHomePage(root){
  const user=store.getCurrentUser(), events=store.getEvents().slice(0,3), posts=store.getPosts().slice(0,3), reviews=store.getReviews().slice(0,3), articles=store.getArticles().slice(0,3);
  const platformStats=[{n:store.getUsers().length,l:"عضو في الدوحة",ic:"users"},{n:store.getPosts().length+store.getReviews().length+store.getArticles().length,l:"منشور ومراجعة",ic:"quill"},{n:store.getReviews().length,l:"قراءة مسجّلة",ic:"book"},{n:store.getEvents().length,l:"فعالية أدبية",ic:"calendar"}];
  root.innerHTML=`
  <section class="hero home-hero"><div class="container hero__grid"><div class="hero__copy"><span class="hero__eyebrow">أهلًا بك مجددًا، ${user.displayName}</span><h1 class="hero__title">دوحة تظلّلها الكلمة، ويجتمع تحتها الكتّاب والقرّاء</h1><p class="hero__lede">شارك نصوصك، سجّل قراءاتك، وخض التجارب الأدبية جنبًا إلى جنب مع مجتمعك.</p><div class="hero__cta"><a href="#/writing" class="btn btn-outline">${icon("feather",{size:17})}<span>ابدأ الكتابة</span></a><a href="#/reading" class="btn btn-outline">${icon("book",{size:17})}<span>ابدأ القراءة</span></a><a href="#/events" class="btn btn-outline">${icon("calendar",{size:17})}<span>تصفّح الفعاليات</span></a></div></div></div></section>
  <section class="section home-platform-stats reveal-on-scroll"><div class="container"><div class="grid grid-4 hero__stats-grid">${platformStats.map(s=>`<div class="card stat-box stat-box--winkle"><span class="stat-box__icon">${icon(s.ic,{size:17})}</span><b class="count-up" data-count="${s.n}">٠</b><span>${s.l}</span></div>`).join('')}</div></div></section>
  <section class="section home-about reveal-on-scroll"><div class="container"><div class="home-about__panel"><span class="eyebrow">عن الدوحة</span><h2>مساحة أدبية تنمو بما يتركه أعضاؤها من أثر</h2><p>دوحة المِداد مجتمع للقراءة والكتابة واللقاء حول الأدب؛ ليست طريقًا واحدًا للجميع، بل مساحة يجد فيها كل قارئ وكاتب ما يناسب رحلته.</p><a href="#/articles" class="btn btn-ghost">اكتشف حكايتنا ${icon("chevronLeft",{size:14})}</a></div></div></section>
  <section class="section home-journey"><div class="container"><div class="section-head"><div><span class="eyebrow">مسارك الشخصي</span><h2>رحلتي في الدوحة</h2></div></div>${journeyCard(user)}</div></section>
  ${personalGoalsCard(user)}
  <section class="section home-now"><div class="container"><div class="section-head"><div><span class="eyebrow">الدوحة الآن</span><h2>ما يحدث الآن</h2></div></div><div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>فعاليات مفتوحة للمشاركة</h3><a href="#/events" class="btn btn-ghost">كل الفعاليات</a></div><div class="grid grid-3">${events.map(ev=>`<a href="#/events/${ev.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill badge-pill--gold">${arNum(ev.participants.length)} مشارك</span></div><h3 class="highlight-card__title">${ev.title}</h3><p>${excerpt(ev.description)}</p><div class="highlight-card__foot"><span>حتى ${new Date(ev.endDate).toLocaleDateString("ar")}</span><span>التفاصيل</span></div></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>أحدث المقالات والملخصات</h3><a href="#/articles" class="btn btn-ghost">قسم المقالات</a></div><div class="grid grid-3">${articles.map(a=>`<a href="#/articles/${a.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill badge-pill--ember">${a.category}</span></div><h3 class="highlight-card__title">${a.title}</h3><p>${excerpt(a.excerpt)}</p></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>أحدث المراجعات</h3><a href="#/reading" class="btn btn-ghost">قسم القراءة</a></div><div class="grid grid-3">${reviews.map(r=>`<a href="#/reading/${r.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill">${store.getUser(r.authorId)?.displayName||"عضو"}</span></div><h3 class="highlight-card__title">${r.bookTitle}</h3><p>${excerpt(r.content)}</p><div class="highlight-card__foot"><span>${timeAgo(r.date)}</span></div></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>آخر ما نشره الأعضاء</h3><a href="#/writing" class="btn btn-ghost">قسم الكتابة</a></div><div class="grid grid-3">${posts.map(p=>`<a href="#/writing/${p.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill">${store.getUser(p.authorId)?.displayName||"عضو"}</span></div><h3 class="highlight-card__title">${p.title}</h3><p>${excerpt(p.content)}</p><div class="highlight-card__foot"><span>${timeAgo(p.date)}</span></div></a>`).join('')}</div></div></div></section>`;

  root.querySelector('#start-journey-survey')?.addEventListener('click',()=>journeySurvey(user)); root.querySelector('#edit-journey-survey')?.addEventListener('click',()=>journeySurvey(user));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls=[...root.querySelectorAll('.reveal-on-scroll')];
  if(reduce){revealEls.forEach(el=>el.classList.add('is-visible')); root.querySelectorAll('.count-up').forEach(el=>el.textContent=arNum(Number(el.dataset.count)||0));}
  else {const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return; e.target.classList.add('is-visible'); if(e.target.classList.contains('home-platform-stats')) e.target.querySelectorAll('.count-up').forEach(el=>animateCount(el)); obs.unobserve(e.target)}),{threshold:.18}); revealEls.forEach(el=>obs.observe(el));}
}

function animateCount(el){const end=Number(el.dataset.count)||0,start=performance.now(),duration=900; const tick=now=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3); el.textContent=arNum(Math.round(end*e)); if(p<1)requestAnimationFrame(tick)}; requestAnimationFrame(tick);}
