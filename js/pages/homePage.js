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

function journeySuggestions(prefs){
  const genre=prefs.genres?.[0]||"الأدب";
  const cards=[];
  if(prefs.roles.includes("reader")) cards.push(
    {k:"خطوتك الآن",t:`بوابة إلى ${genre}`,d:`مراجعة افتراضية: «ما الذي يجعل عوالم ${genre} مقنعة؟»`,href:"#/reading",ic:"book",tag:"قراءة"},
    {k:"قد يعجبك",t:`اختيار قارئ من ${genre}`,d:"كتاب افتراضي مقترح لتجربة شكل التوصيات الشخصية قبل إضافة المحتوى الحقيقي.",href:"#/reading",ic:"book",tag:"اقتراح"}
  );
  if(prefs.roles.includes("writer")) cards.push(
    {k:"خطوتك الآن",t:`اكتب مشهدًا من ${genre}`,d:"تحدٍ افتراضي قصير: اكتب مشهدًا يبدأ بتفصيل صغير يغيّر العالم كله.",href:"#/writing",ic:"feather",tag:"كتابة"},
    {k:"من المجتمع",t:"نص ينتظر قارئه الأول",d:"منشور افتراضي يوضح كيف ستظهر النصوص المتوافقة مع اهتمامات الكاتب.",href:"#/writing",ic:"quill",tag:"نص"}
  );
  if(prefs.roles.includes("events")) cards.push(
    {k:"في الدوحة الآن",t:`أمسية ${genre}`,d:"فعالية افتراضية للمناقشة والقراءة الجماعية، أضفناها لتجربة هذا المسار.",href:"#/events",ic:"calendar",tag:"فعالية"},
    {k:"موعد قريب",t:"تحدّي سبعة أيام",d:"فعالية افتراضية قصيرة تساعدنا على رؤية شكل الرحلة عندما توجد مواعيد قادمة.",href:"#/events",ic:"calendar",tag:"تحدٍّ"}
  );
  if(prefs.roles.includes("discussion")) cards.push(
    {k:"نقاش مقترح",t:`هل النوع أهم أم الفكرة؟`,d:`نقاش افتراضي حول ${genre} يوضح كيف ستقترح الدوحة الحوارات المناسبة للعضو.`,href:"#/articles",ic:"messageCircle",tag:"نقاش"},
    {k:"رأي يستحق القراءة",t:"وجهتا نظر في عمل واحد",d:"مادة افتراضية لتجربة مسار العضو الذي يفضّل الحوار أكثر من النشر.",href:"#/articles",ic:"messageCircle",tag:"حوار"}
  );
  cards.push({k:"فاجئني",t:"اخرج قليلًا من مسارك المعتاد",d:"اقتراح من باب أدبي مختلف حتى لا تتحول اهتماماتك إلى فقاعة مغلقة.",href:"#/articles",ic:"sparkles",tag:"اكتشاف"});
  return cards;
}

function journeyCard(user){
  const prefs=store.getJourneyPreferences?.(user.id);
  if(!prefs?.roles?.length){
    return `<div class="journey-welcome card"><span class="journey-welcome__mark">${icon("compass",{size:26})}</span><div><h3>لنرسم رحلتك في الدوحة</h3><p>أخبرنا بما تحب: القراءة، الكتابة، الفعاليات، والأنواع الأدبية التي تجذبك. سنبني لك مسارًا يناسبك دون أن نفرض عليك طريقًا واحدًا.</p></div><button class="btn btn-primary" id="start-journey-survey">ابدأ الاستفتاء</button></div>`;
  }
  const cards=journeySuggestions(prefs);
  return `<div class="journey-summary"><button class="journey-summary__open" id="open-journey-details"><span>${icon("compass",{size:18})}</span><b>تفاصيل رحلتي</b><small>اعرف لماذا ظهرت لك هذه الخطوات وإلى أين يقودك مسارك</small></button></div><div class="journey-track journey-step-route">
      <svg class="journey-step-route__line" viewBox="0 0 900 720" preserveAspectRatio="none" aria-hidden="true"><path d="M150 600 H330 V430 H540 V260 H750 V90"/></svg>
      ${cards.slice(0,4).map((c,i)=>`<a href="${c.href}" class="card journey-card journey-step-card reveal-on-scroll journey-step-card--${i+1}" style="--reveal-delay:${i*110}ms"><span class="journey-card__step">${arNum(i+1)}</span><span class="journey-card__icon">${icon(c.ic,{size:20})}</span><small>${c.k}</small><h3>${c.t}</h3><p>${c.d}</p><span class="journey-card__tag">${c.tag}</span></a>`).join("")}
    </div><div class="journey-actions"><button class="btn btn-ghost" id="open-journey-details-2">عرض الرحلة كاملة</button><button class="btn btn-ghost journey-edit" id="edit-journey-survey">تعديل اهتمامات رحلتي</button></div>`;
}

function openInfoModal(html, extraClass=""){
  const overlay=document.createElement('div'); overlay.className='modal-overlay';
  overlay.innerHTML=`<div class="modal-box ${extraClass}"><button class="modal-close" aria-label="إغلاق">×</button>${html}</div>`;
  document.body.appendChild(overlay); const close=()=>overlay.remove(); overlay.querySelector('.modal-close').onclick=close; overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
}

function showJourneyDetails(user){
  const prefs=store.getJourneyPreferences?.(user.id);
  if(!prefs?.roles?.length){ journeySurvey(user); return; }
  const roleNames={reader:"قارئ",writer:"كاتب",events:"محب الفعاليات",discussion:"محب النقاشات"};
  const cards=journeySuggestions(prefs);
  openInfoModal(`<span class="eyebrow">مسارك الشخصي</span><h2>رحلتي في الدوحة</h2><p class="journey-detail-lede">هذه ليست قائمة واجبات ثابتة. بُني المسار من اختياراتك، بينما تتبدّل الاقتراحات داخله عندما يظهر في الدوحة ما يناسبك.</p><div class="journey-profile"><div><small>طريقتك في الدوحة</small><b>${prefs.roles.map(r=>roleNames[r]).filter(Boolean).join(" · ")}</b></div><div><small>اهتماماتك</small><b>${(prefs.genres||[]).join(" · ")||"متنوعة"}</b></div><div><small>ما تريد الوصول إليه</small><b>${(prefs.goals||[]).join(" · ")||"رحلة مفتوحة"}</b></div></div><h3 class="journey-detail-title">محطات مقترحة الآن</h3><div class="journey-detail-list">${cards.map((c,i)=>`<a href="${c.href}" class="journey-detail-item"><span>${arNum(i+1)}</span><div><small>${c.k}</small><b>${c.t}</b><p>${c.d}</p></div></a>`).join("")}</div><p class="journey-demo-note">المحتوى الظاهر هنا تجريبي الآن حتى نرى جميع المسارات. لاحقًا سيُستبدل تلقائيًا بالمحتوى الحقيقي المنشور في الدوحة.</p>`,"journey-details-modal");
}

function showAboutStory(){
  openInfoModal(`<span class="eyebrow">حكاية الدوحة</span><h2>لماذا وُجدت دوحة المِداد؟</h2><div class="about-story"><p>بدأت الدوحة من فكرة بسيطة: ألا تكون القراءة والكتابة صفحتين منفصلتين، بل مجتمعًا يلتقي فيه من يكتب بمن يقرأ، ومن يبحث عن كتاب بمن يريد مناقشته.</p><p>لذلك تجمع المنصة النصوص، القراءات والمراجعات، المقالات والملخصات، الفعاليات، الأهداف الشخصية، والأوسمة في مكان واحد. ولا تفترض أن كل قارئ كاتب أو أن كل كاتب يسلك الطريق نفسه.</p><h3>والمدونة؟</h3><p>قسم المقالات هو مدونة الدوحة: مساحة للمقالات والملخصات والمواد المعرفية التي تبقى قابلة للرجوع إليها، بينما تظل بقية المنصة أكثر حركة وتفاعلًا.</p><h3>رحلة كل عضو مختلفة</h3><p>يختار العضو اهتماماته، ثم تقترح الدوحة عليه أبوابًا تناسبه. المسار الأساسي يستمر معه، أما بطاقات اليوم فتتجدد مع نشاط المجتمع وتقدمه الشخصي.</p></div>`,"about-story-modal");
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
  const user=store.getCurrentUser(), events=store.getEvents().slice(0,6), posts=store.getPosts().slice(0,6), reviews=store.getReviews().slice(0,6), articles=store.getArticles().slice(0,6);
  const allSocial=[...store.getPosts(),...store.getReviews()], interactionCount=allSocial.reduce((sum,item)=>sum+(item.likedBy?.length||0)+(item.comments?.length||0)+(item.views||0),0)+store.getReviews().length; const platformStats=[{n:store.getUsers().length,l:"عضو في الدوحة",ic:"users"},{n:store.getPosts().length+store.getReviews().length+store.getArticles().length,l:"منشور ومراجعة",ic:"quill"},{n:interactionCount,l:"التفاعلات والمناقشات",ic:"heart"},{n:store.getEvents().length,l:"فعالية أدبية",ic:"calendar"}];
  root.innerHTML=`
  <section class="hero home-hero"><div class="container hero__grid"><div class="hero__copy"><span class="hero__eyebrow">أهلًا بك مجددًا، ${user.displayName}</span><h1 class="hero__title">دوحة تظلّلها الكلمة، ويجتمع تحتها الكتّاب والقرّاء</h1><p class="hero__lede">شارك نصوصك، سجّل قراءاتك، وخض التجارب الأدبية جنبًا إلى جنب مع مجتمعك.</p><div class="hero__cta"><a href="#/writing" class="btn btn-outline">${icon("feather",{size:17})}<span>ابدأ الكتابة</span></a><a href="#/reading" class="btn btn-outline">${icon("book",{size:17})}<span>ابدأ القراءة</span></a><a href="#/events" class="btn btn-outline">${icon("calendar",{size:17})}<span>تصفّح الفعاليات</span></a></div></div></div></section>
  <section class="section home-platform-stats reveal-on-scroll"><div class="container"><div class="grid grid-4 hero__stats-grid">${platformStats.map(s=>`<div class="card stat-box stat-box--winkle"><span class="stat-box__icon">${icon(s.ic,{size:17})}</span><b class="count-up" data-count="${s.n}">٠</b><span>${s.l}</span></div>`).join('')}</div></div></section>
  <section class="section home-about reveal-on-scroll"><div class="container"><div class="home-about__panel"><span class="eyebrow">عن الدوحة</span><h2>مساحة أدبية تنمو بما يتركه أعضاؤها من أثر</h2><p>دوحة المِداد مجتمع للقراءة والكتابة واللقاء حول الأدب؛ ليست طريقًا واحدًا للجميع، بل مساحة يجد فيها كل قارئ وكاتب ما يناسب رحلته.</p><button type="button" id="open-about-story" class="btn btn-ghost">اكتشف حكايتنا ${icon("chevronLeft",{size:14})}</button></div></div></section>
  <section class="section home-journey"><div class="container"><div class="section-head"><div><span class="eyebrow">مسارك الشخصي</span><h2>رحلتي في الدوحة</h2></div></div>${journeyCard(user)}</div></section>
  ${personalGoalsCard(user)}
  <section class="section home-members-preview"><div class="container"><div class="section-head"><div><span class="eyebrow">أهل الدوحة</span><h2>مجتمع من خمسين عضوًا</h2><p>عينة من الأعضاء التجريبيين حتى نرى المنصة وهي ممتلئة فعلًا.</p></div></div><div class="home-member-cloud reveal-on-scroll">${store.getUsers().slice(0,18).map(u=>`<a href="#/profile/${u.id}" class="home-member-chip"><span class="home-member-chip__avatar">${(u.displayName||"ع").trim().charAt(0)}</span><span><b>${u.displayName}</b><small>${u.bio||"عضو في الدوحة"}</small></span></a>`).join("")}</div></div></section><section class="section home-now"><div class="container"><div class="section-head"><div><span class="eyebrow">الدوحة الآن</span><h2>ما يحدث الآن</h2></div></div><div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>فعاليات مفتوحة للمشاركة</h3><a href="#/events" class="btn btn-ghost">كل الفعاليات</a></div><div class="grid grid-3 home-rich-grid">${events.map(ev=>`<a href="#/events/${ev.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill badge-pill--gold">${arNum(ev.participants.length)} مشارك</span></div><h3 class="highlight-card__title">${ev.title}</h3><p>${excerpt(ev.description)}</p><div class="highlight-card__foot"><span>حتى ${new Date(ev.endDate).toLocaleDateString("ar")}</span><span>التفاصيل</span></div></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>أحدث المقالات والملخصات</h3><a href="#/articles" class="btn btn-ghost">قسم المقالات</a></div><div class="grid grid-3 home-rich-grid">${articles.map(a=>`<a href="#/articles/${a.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill badge-pill--ember">${a.category}</span></div><h3 class="highlight-card__title">${a.title}</h3><p>${excerpt(a.excerpt)}</p></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>أحدث المراجعات</h3><a href="#/reading" class="btn btn-ghost">قسم القراءة</a></div><div class="grid grid-3 home-rich-grid">${reviews.map(r=>`<a href="#/reading/${r.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill">${store.getUser(r.authorId)?.displayName||"عضو"}</span></div><h3 class="highlight-card__title">${r.bookTitle}</h3><p>${excerpt(r.content)}</p><div class="highlight-card__foot"><span>${timeAgo(r.date)}</span></div></a>`).join('')}</div></div>
  <div class="home-now__group reveal-on-scroll"><div class="section-head section-head--compact"><h3>آخر ما نشره الأعضاء</h3><a href="#/writing" class="btn btn-ghost">قسم الكتابة</a></div><div class="grid grid-3 home-rich-grid">${posts.map(p=>`<a href="#/writing/${p.id}" class="card card--hover highlight-card home-update-card"><div class="highlight-card__meta"><span class="badge-pill">${store.getUser(p.authorId)?.displayName||"عضو"}</span></div><h3 class="highlight-card__title">${p.title}</h3><p>${excerpt(p.content)}</p><div class="highlight-card__foot"><span>${timeAgo(p.date)}</span></div></a>`).join('')}</div></div></div></section>`;

  root.querySelector('#start-journey-survey')?.addEventListener('click',()=>journeySurvey(user)); root.querySelector('#edit-journey-survey')?.addEventListener('click',()=>journeySurvey(user)); root.querySelector('#open-journey-details')?.addEventListener('click',()=>showJourneyDetails(user)); root.querySelector('#open-journey-details-2')?.addEventListener('click',()=>showJourneyDetails(user)); root.querySelector('#open-about-story')?.addEventListener('click',showAboutStory);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls=[...root.querySelectorAll('.reveal-on-scroll')];
  if(reduce){revealEls.forEach(el=>el.classList.add('is-visible')); root.querySelectorAll('.count-up').forEach(el=>el.textContent=arNum(Number(el.dataset.count)||0));}
  else {const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return; e.target.classList.add('is-visible'); if(e.target.classList.contains('home-platform-stats')) e.target.querySelectorAll('.count-up').forEach(el=>animateCount(el)); obs.unobserve(e.target)}),{threshold:.18}); revealEls.forEach(el=>obs.observe(el));}
}

function animateCount(el){const end=Number(el.dataset.count)||0,start=performance.now(),duration=900; const tick=now=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3); el.textContent=arNum(Math.round(end*e)); if(p<1)requestAnimationFrame(tick)}; requestAnimationFrame(tick);}

