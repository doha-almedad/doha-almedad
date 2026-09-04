/* =========================================================
   دوحة المداد — profilePage.js
   7. صفحة البروفايل: حماسة الأدب، الأوسمة، وقاعدة إخفاء الصفر
   ========================================================= */

import { store } from "../db/store.js";
import { streakService } from "../services/streakService.js";
import { badgeService } from "../services/badgeService.js";
import { renderBadgeCard, bindBadgeCards, sortBadgesUnlockedFirst } from "../components/badgeCard.js";
import { xpProgressWithinLevel } from "../services/rewardEngine.js";
import { icon, initial, publicRoleLabel, parseSocialLink, arNum, avatarHtml } from "../components/icons.js";
import { openModal, closeModal, showToast } from "../components/modals.js";
import { cropImageFile } from "../services/mediaService.js";

let showAllBadges = false;
let showAllRecentActivity = false;
let recentProfileId = null;
let activeProfileSection = "profile";

function miniStat(value, label, iconName, { showZero = false } = {}){
  if(!value && !showZero) return "";
  return `<div class="mini-stat"><span class="mini-stat__icon">${icon(iconName, { size: 16 })}</span><b>${arNum(value)}</b><span>${label}</span></div>`;
}

function activeDaysCount(user){
  return Object.values(user.activityLog || {}).filter(n => n > 0).length;
}

function heatmapGridHtml(user){
  const { weeks, monthMarkers, weekdayLabels } = streakService.buildHeatmapWeeks(user, 30);
  const monthRow = weeks.map((_, w) => {
    const marker = monthMarkers.find(m => m.week === w);
    return `<div class="ink-heatmap2__month">${marker ? marker.label : ""}</div>`;
  }).join("");

  const dayRows = weekdayLabels.map((label, row) => {
    const cells = weeks.map(week => {
      const c = week[row];
      if(!c) return `<div class="ink-heatmap2__cell ink-heatmap2__cell--empty"></div>`;
      return `<div class="ink-heatmap2__cell ${c.isToday ? "is-today" : ""}" data-level="${c.level}" title="${c.date} · ${c.count} نشاط"></div>`;
    }).join("");
    return `<div class="ink-heatmap2__row"><span class="ink-heatmap2__label">${label}</span><div class="ink-heatmap2__cells">${cells}</div></div>`;
  }).join("");

  return `
    <div class="ink-heatmap2">
      <div class="ink-heatmap2__months"><span class="ink-heatmap2__label"></span><div class="ink-heatmap2__months-track">${monthRow}</div></div>
      ${dayRows}
    </div>
  `;
}

function socialLinkPill(rawUrl){
  const parsed = parseSocialLink(rawUrl);
  if(!parsed) return "";
  return `<a href="${parsed.url}" target="_blank" rel="noopener" class="badge-pill profile-social-pill">${icon(parsed.platform, { size: 13 })}<span>@${parsed.handle}</span></a>`;
}

function openEditProfileModal(user, root, userId){
  let pendingAvatar = null;
  let avatarRemoved = false;
  openModal(`
    <div class="modal-box__head"><h3>تعديل الملف الشخصي</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="field" style="text-align:center;">
      <label class="avatar-edit-upload">
        <div class="avatar avatar--lg" id="avatar-edit-preview" style="margin:0 auto;">${avatarHtml(user)}</div>
        <span class="avatar-edit-upload__badge">${icon("image", { size: 13 })}</span>
        <input type="file" id="edit-avatar-input" accept="image/*" hidden>
      </label>
      ${user.avatarImage ? `<button type="button" class="btn btn-ghost btn-sm" id="remove-avatar-btn" style="margin-top:8px;">${icon("close", { size: 12 })}<span>حذف الصورة</span></button>` : ""}
    </div>
    <div class="field"><label>الاسم</label><input type="text" id="edit-name" value="${user.displayName}"></div>
    <div class="field"><label>اسم المستخدم</label><input type="text" id="edit-username" value="${user.username}" dir="ltr" style="text-align:left;"></div>
    <div class="field"><label>نبذة عنك</label><textarea id="edit-bio" placeholder="اكتب نبذة قصيرة...">${user.bio || ""}</textarea></div>
    <div class="field">
      <label>رابط حساب التواصل الاجتماعي (اختياري)</label>
      <input type="text" id="edit-social" placeholder="https://instagram.com/username" value="${user.socialUrl || ""}">
      <div class="field-hint">يُعرض تلقائيًا باسم المستخدم مع أيقونة المنصة.</div>
    </div>
    <button class="btn btn-primary btn-block" id="save-profile-btn">حفظ التغييرات</button>
  `, {
    onMount(box){
      const avatarPreview = box.querySelector("#avatar-edit-preview");
      box.querySelector("#edit-avatar-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        pendingAvatar = await cropImageFile(file, { aspectRatio:1, outputWidth:500, title:"قص صورة الأفتار", allowTemplates:false });
        if(!pendingAvatar) return;
        avatarRemoved = false;
        avatarPreview.innerHTML = `<img src="${pendingAvatar}" alt="">`;
      });
      box.querySelector("#remove-avatar-btn")?.addEventListener("click", () => {
        pendingAvatar = null;
        avatarRemoved = true;
        box.querySelector("#avatar-edit-preview").innerHTML = initial(user.displayName);
        box.querySelector("#remove-avatar-btn").remove();
      });
      box.querySelector("#save-profile-btn").addEventListener("click", () => {
        const displayName = box.querySelector("#edit-name").value.trim();
        const username = box.querySelector("#edit-username").value.trim();
        const bio = box.querySelector("#edit-bio").value.trim();
        const socialUrl = box.querySelector("#edit-social").value.trim();
        if(!displayName || !username) return;
        const patch = { displayName, username, bio, socialUrl, avatarScale: 1 };
        if(pendingAvatar) patch.avatarImage = pendingAvatar;
        else if(avatarRemoved) patch.avatarImage = null;
        store.updateUser(user.id, patch);
        closeModal();
        showToast("تم تحديث ملفك الشخصي");
        renderProfilePage(root, userId);
      });
    }
  });
}

const PERSONAL_GOAL_LABELS = { writing:"الكتابة", reading:"القراءة", events:"الفعاليات", articles:"المقالات" };

function personalGoalDetails(goals){
  return (goals.sections || []).map(section => {
    let detail = "";
    if(section === "writing") detail = `${arNum(goals.writing?.count||0)} نصوص · ${arNum(goals.writing?.words||0)} كلمة · ${goals.writing?.type||"متنوع"}${goals.writing?.deadline?` · حتى ${goals.writing.deadline}`:""}`;
    if(section === "reading") detail = `${arNum(goals.reading?.count||0)} كتب${goals.reading?.deadline?` · حتى ${goals.reading.deadline}`:""}${goals.reading?.titles?.length?` · ${goals.reading.titles.join("، ")}`:""}`;
    if(section === "events") detail = (goals.events||[]).map(id=>store.getEvent(id)?.title).filter(Boolean).join("، ") || "لم تُحدّد فعالية بعد";
    if(section === "articles") detail = (goals.articles||[]).map(id=>store.getArticle(id)?.title).filter(Boolean).join("، ") || "لم تُحدّد مقالة بعد";
    return `<div class="personal-goal-summary"><b>${PERSONAL_GOAL_LABELS[section]}</b><span>${detail}</span></div>`;
  }).join("");
}

function personalSpaceHtml(user){
  const goals = store.getPersonalGoals(user.id);
  const drafts = store.getDrafts(user.id);
  const library = store.getPersonalLibrary(user.id);
  return `<section class="personal-space" id="personal-space">
    <div class="section-head"><div><span class="eyebrow">خاص بك وحدك</span><h2>${icon("lock",{size:20,cls:"heading-icon"})} مساحتي</h2></div><span class="badge-pill">لا يراها الآخرون</span></div>
    <div class="personal-space__grid">
      <div class="card personal-space__panel personal-space__panel--goals">
        <div class="personal-space__panel-head"><h3>أهدافي الشخصية</h3><button class="btn btn-outline btn-sm" id="edit-personal-goals">${icon("target",{size:14})}<span>إدارة الأهداف</span></button></div>
        ${goals.sections?.length ? `<div class="personal-goal-chips">${goals.sections.map(s=>`<span class="badge-pill badge-pill--gold">${PERSONAL_GOAL_LABELS[s]}</span>`).join("")}</div><div class="personal-goal-summaries">${personalGoalDetails(goals)}</div>` : `<p class="text-muted">لم تضف أهدافًا شخصية بعد. اختر فقط ما ترغب في متابعته.</p>`}
      </div>
      <div class="card personal-space__panel personal-space__panel--drafts">
        <div class="personal-space__panel-head"><h3>مسوداتي</h3><button class="btn btn-primary btn-sm" id="new-private-draft">${icon("plus",{size:14})}<span>مسودة جديدة</span></button></div>
        ${drafts.length ? `<div class="private-drafts">${drafts.map(d=>`<article class="private-draft"><div class="private-draft__rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="private-draft__paper"><span class="private-draft__type">${d.type}</span><b>${d.title}</b><p>${(d.content||"مسودة فارغة").slice(0,95)}${(d.content||"").length>95?"…":""}</p><small>محفوظة خصوصًا</small><div class="private-draft__actions"><button class="btn btn-outline btn-sm" data-open-draft="${d.id}">فتح المسودة</button><button class="btn btn-ghost btn-sm" data-edit-draft="${d.id}">تعديل</button><button class="btn btn-danger btn-sm" data-delete-draft="${d.id}">حذف</button></div></div></article>`).join("")}</div>` : `<p class="text-muted">لا توجد مسودات محفوظة حتى الآن.</p>`}
      </div>
      <div class="card personal-space__panel personal-space__panel--wide personal-space__panel--library">
        <div class="personal-space__panel-head"><h3>مكتبتي</h3><button class="btn btn-primary btn-sm" id="new-private-book">${icon("plus",{size:14})}<span>إضافة كتاب</span></button></div>
        ${library.length?`<div class="private-library">${library.map(b=>`<div class="private-book"><div><b>${b.title}</b><span class="rating-stars">${Array.from({length:5},(_,i)=>icon("star",{size:12,cls:i<b.rating?"star-filled":"star-empty"})).join("")}</span>${b.note?`<small>${b.note}</small>`:""}</div><div><button class="btn btn-outline btn-sm" data-open-private-book="${b.id}">فتح</button><button class="btn btn-ghost btn-sm" data-edit-private-book="${b.id}">تعديل</button><button class="btn btn-danger btn-sm" data-delete-private-book="${b.id}">حذف</button></div></div>`).join("")}</div>`:`<p class="text-muted">مكتبتك الخاصة فارغة. أضف كتابًا واحتفظ بتقييمك وملاحظتك.</p>`}
      </div>
    </div>
  </section>`;
}

function openDraftViewModal(draft, onEdit){
  if(!draft) return;
  openModal(`<div class="modal-box__head"><div><span class="badge-pill">${draft.type}</span><h3 style="margin-top:8px;">${draft.title}</h3></div><button class="modal-close" data-close>${icon("close",{size:18})}</button></div><div class="draft-reading-sheet">${draft.content?`<p>${draft.content}</p>`:`<p class="text-muted">هذه المسودة فارغة.</p>`}</div><button class="btn btn-primary btn-block" id="edit-open-draft">${icon("feather",{size:14})}<span>تعديل المسودة</span></button>`,{size:"lg",onMount(box){box.querySelector("#edit-open-draft").onclick=()=>{closeModal();onEdit();};}});
}

function openPrivateBookModal(user, book, rerender){
  const goalTitles=store.getPersonalGoals(user.id).reading?.titles||[];
  const knownTitles=[...new Set([...(book?.title?[book.title]:[]),...goalTitles])];
  openModal(`<div class="modal-box__head"><h3>${book?"تعديل التقييم":"إضافة تقييم إلى مكتبتي"}</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div><div class="field"><label>عنوان الكتاب</label>${knownTitles.length?`<select id="private-book-title-choice"><option value="">اختر من عناوين هدفك القرائي</option>${knownTitles.map(t=>`<option value="${t}" ${book?.title===t?"selected":""}>${t}</option>`).join("")}<option value="__other__">عنوان آخر…</option></select><input id="private-book-title" placeholder="اكتب عنوان الكتاب" style="display:none;margin-top:8px;">`:`<input id="private-book-title" placeholder="اكتب عنوان الكتاب" value="${book?.title||""}">`}</div><div class="field"><label>تقييمي</label><select id="private-book-rating">${[5,4,3,2,1].map(n=>`<option value="${n}" ${book?.rating===n?"selected":""}>${n} من 5</option>`).join("")}</select></div><div class="field"><label>ملاحظتي الخاصة</label><textarea id="private-book-note">${book?.note||""}</textarea><small class="field-hint">يمكنك إضافة تقييم آخر للكتاب نفسه لاحقًا، وسيُحفظ كل تقييم بصورة مستقلة.</small></div><button class="btn btn-primary btn-block" id="save-private-book">حفظ في مكتبتي</button>`,{onMount(box){const choice=box.querySelector("#private-book-title-choice"),titleInput=box.querySelector("#private-book-title");if(choice)choice.onchange=()=>{titleInput.style.display=choice.value==="__other__"?"block":"none";if(choice.value!=="__other__")titleInput.value="";};box.querySelector("#save-private-book").onclick=()=>{const title=(choice&&choice.value!=="__other__"?choice.value:titleInput.value).trim();if(!title){showToast("اختر عنوان الكتاب أو اكتبه");return;}const data={id:book?.id,title,rating:Number(box.querySelector("#private-book-rating").value),note:box.querySelector("#private-book-note").value.trim()};showToast("جارٍ الحفظ في مكتبتك…");setTimeout(()=>{store.savePersonalBook(user.id,data);closeModal();rerender();showToast("حُفظ التقييم في مكتبتك");},30);};}});
}

function openPrivateBookView(book){
  if(!book)return;openModal(`<div class="modal-box__head"><h3>${book.title}</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div><div class="rating-stars" style="margin-bottom:14px;">${Array.from({length:5},(_,i)=>icon("star",{size:20,cls:i<book.rating?"star-filled":"star-empty"})).join("")}</div><div class="card card--flat"><b>ملاحظاتي</b><p style="white-space:pre-wrap;margin-top:8px;">${book.note||"لا توجد ملاحظات لهذا الكتاب."}</p></div>`);
}

function openDraftModal(user, draft, rerender){
  openModal(`<div class="modal-box__head"><h3>${draft?"تعديل المسودة":"مسودة جديدة"}</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div>
    <div class="field"><label>العنوان</label><input id="draft-title" value="${draft?.title||""}"></div>
    <div class="field"><label>نوع النص</label><select id="draft-type">${["قطعة أدبية","قصة قصيرة","نص شعري","خاطرة","مقالة رأي","فصل من عمل"].map(x=>`<option ${draft?.type===x?"selected":""}>${x}</option>`).join("")}</select></div>
    <div class="field"><label>المسودة</label><textarea id="draft-content" style="min-height:220px;">${draft?.content||""}</textarea></div>
    <p class="field-hint">هذه المسودة خاصة ولا تظهر في صفحات النشر.</p><button class="btn btn-primary btn-block" id="save-private-draft">حفظ المسودة</button>`, {size:"lg",onMount(box){box.querySelector("#save-private-draft").onclick=()=>{const title=box.querySelector("#draft-title").value.trim(); if(!title){showToast("اكتب عنوانًا للمسودة");return;}const data={id:draft?.id,title,type:box.querySelector("#draft-type").value,content:box.querySelector("#draft-content").value};showToast("جارٍ حفظ المسودة…");setTimeout(()=>{store.saveDraft(user.id,data);closeModal();rerender();showToast("حُفظت المسودة في مساحتك");},30);};}});
}

function openPersonalGoalsModal(user, rerender){
  const old = store.getPersonalGoals(user.id);
  const selected = new Set(old.sections || []);
  const events = store.getEvents().filter(e=>!(e.participants||[]).includes(user.id));
  const articles = store.getArticles().filter(a=>!(user.readArticleIds||[]).includes(a.id));
  const checked = key => selected.has(key) ? "checked" : "";
  openModal(`<div class="modal-box__head"><h3>أهدافي الشخصية</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div>
    <p class="text-muted">اختر الأقسام التي تريدها فقط؛ لا يلزم تعبئة الجميع.</p>
    <div class="personal-goal-picker">
      ${[["writing","الكتابة"],["reading","القراءة"],["events","الفعاليات"],["articles","المقالات"]].map(([k,l])=>`<label class="goal-choice"><input type="checkbox" data-goal-toggle="${k}" ${checked(k)}><span>${l}</span></label>`).join("")}
    </div>
    <div class="personal-goal-fields ${selected.has("writing")?"":"is-hidden"}" data-goal-fields="writing"><h4>هدف الكتابة</h4><div class="composer__meta"><div class="field"><label>عدد النصوص</label><input type="number" min="0" id="pg-writing-count" value="${old.writing?.count||""}"></div><div class="field"><label>عدد الكلمات</label><input type="number" min="0" id="pg-writing-words" value="${old.writing?.words||""}"></div></div><div class="composer__meta"><div class="field"><label>نوع النص</label><select id="pg-writing-type"><option>متنوع</option>${["قطعة أدبية","قصة قصيرة","نص شعري","خاطرة","مقالة رأي","فصل من عمل"].map(x=>`<option ${old.writing?.type===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="field"><label>الموعد النهائي</label><input type="date" id="pg-writing-deadline" value="${old.writing?.deadline||""}"></div></div></div>
    <div class="personal-goal-fields ${selected.has("reading")?"":"is-hidden"}" data-goal-fields="reading"><h4>هدف القراءة</h4><div class="composer__meta"><div class="field"><label>عدد الكتب</label><input type="number" min="0" id="pg-reading-count" value="${old.reading?.count||""}"></div><div class="field"><label>تاريخ الانتهاء</label><input type="date" id="pg-reading-deadline" value="${old.reading?.deadline||""}"></div></div><div class="field"><label>عناوين الكتب</label><textarea id="pg-reading-titles" placeholder="افصل بين العناوين بفاصلة عربية (،) أو إنجليزية (,) أو بسطر جديد">${(old.reading?.titles||old.reading?.books?.map(b=>b.title)||[]).join("، ")}</textarea></div></div>
    <div class="personal-goal-fields ${selected.has("events")?"":"is-hidden"}" data-goal-fields="events"><h4>الفعاليات التي أنوي المشاركة فيها</h4><div class="goal-options-list">${events.map(e=>`<label><input type="checkbox" data-goal-event value="${e.id}" ${(old.events||[]).includes(e.id)?"checked":""}> ${e.title}</label>`).join("")||"لا توجد فعاليات متاحة"}</div></div>
    <div class="personal-goal-fields ${selected.has("articles")?"":"is-hidden"}" data-goal-fields="articles"><h4>المقالات التي أنوي قراءتها</h4><div class="goal-options-list">${articles.map(a=>`<label><input type="checkbox" data-goal-article value="${a.id}" ${(old.articles||[]).includes(a.id)?"checked":""}> ${a.title}</label>`).join("")||"لا توجد مقالات متاحة"}</div></div>
    <button class="btn btn-primary btn-block" id="save-personal-goals">حفظ أهدافي</button>`, {size:"lg",onMount(box){
      box.querySelectorAll("[data-goal-toggle]").forEach(input=>input.onchange=()=>box.querySelector(`[data-goal-fields="${input.dataset.goalToggle}"]`).classList.toggle("is-hidden",!input.checked));
      box.querySelector("#save-personal-goals").onclick=()=>{const sections=[...box.querySelectorAll("[data-goal-toggle]:checked")].map(x=>x.dataset.goalToggle);const titles=[...new Set(box.querySelector("#pg-reading-titles").value.split(/[،,;؛\n]+/).map(x=>x.trim()).filter(Boolean))];const data={sections,baseline:{words:user.stats.wordsWritten||0,posts:store.getPosts().filter(p=>p.authorId===user.id).length,booksRead:user.stats.booksRead||0,personalBooks:store.getPersonalLibrary(user.id).length},writing:{count:Number(box.querySelector("#pg-writing-count").value)||0,words:Number(box.querySelector("#pg-writing-words").value)||0,type:box.querySelector("#pg-writing-type").value,deadline:box.querySelector("#pg-writing-deadline").value},reading:{count:Number(box.querySelector("#pg-reading-count").value)||0,deadline:box.querySelector("#pg-reading-deadline").value,titles},events:[...box.querySelectorAll("[data-goal-event]:checked")].map(x=>x.value),articles:[...box.querySelectorAll("[data-goal-article]:checked")].map(x=>x.value)};showToast("جارٍ حفظ أهدافك…");setTimeout(()=>{store.setPersonalGoals(user.id,data);closeModal();rerender();showToast("حُفظت أهدافك الشخصية");},30);};
    }});
}

export function renderProfilePage(root, userId){
  const user = userId ? store.getUser(userId) : store.getCurrentUser();
  if(!user){
    root.innerHTML = `<div class="container section"><div class="empty-state">لم يُعثر على هذا العضو.</div></div>`;
    return;
  }
  const isOwnProfile = user.id === store.getCurrentUser().id;
  if(recentProfileId !== user.id){ recentProfileId = user.id; showAllRecentActivity = false; activeProfileSection = "profile"; }
  const roleTag = publicRoleLabel(user.role);

  const stats = user.stats;
  const miniStats = [
    miniStat(user.xp, "النقاط", "star", { showZero: true }),
    miniStat(stats.wordsWritten, "الكلمات المكتوبة", "quill"),
    miniStat(stats.booksPublished, "الكتب المنشورة", "book"),
    miniStat(stats.booksRead, "الكتب المقروءة", "book"),
    miniStat(Object.keys(user.badges || {}).length, "الأوسمة", "medal"),
  ].filter(Boolean);

  const describedBadges = sortBadgesUnlockedFirst(badgeService.describeAllForUser(user));
  const visibleBadges = showAllBadges ? describedBadges : describedBadges.slice(0, 7);
  const allRecentActivity = [
    ...store.getPosts().filter(p => p.authorId === user.id).map(p => ({ kind: "post", id: p.id, title: p.title, tag: "كتابة", ic: "feather", date: p.date, image: (p.images && p.images[0]) || p.image || null, href: `#/writing/${p.id}` })),
    ...store.getReviews().filter(r => r.authorId === user.id).map(r => ({ kind: "review", id: r.id, title: r.bookTitle, tag: "قراءة", ic: "book", date: r.date, image: (r.images && r.images[0]) || r.image || null, href: `#/reading/${r.id}` })),
    ...store.getArticles().filter(a => a.author === user.id).map(a => ({ kind: "article", id: a.id, title: a.title, tag: "مقال", ic: "document", date: a.date, image: (a.images && a.images[0]) || a.image || null, href: `#/articles/${a.id}` })),
    ...store.getUserEvents(user.id).filter(e => e.type === "join_event").map(e => {
      const ev = store.getEvent(e.meta.eventId);
      return ev ? { kind: "event", id: ev.id, title: ev.title, tag: "فعالية", ic: "calendar", date: e.timestamp, image: null, href: `#/events/${ev.id}` } : null;
    }).filter(Boolean),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivity = showAllRecentActivity ? allRecentActivity : allRecentActivity.slice(0, 3);
  const prog = xpProgressWithinLevel(user);

  root.innerHTML = `
    <section class="section">
      <div class="container container--narrow">

        <div class="profile-head-v2 profile-head-v2--plain">
          <div class="avatar avatar--xl">${avatarHtml(user)}</div>
          <div class="profile-head-v2__name-row">
            <h2 class="profile-head-v2__name">${user.displayName}</h2>
            ${roleTag ? `<span class="badge-pill badge-pill--sage">${icon("shield", { size: 12 })}<span>${roleTag}</span></span>` : ""}
          </div>
          <div class="profile-head-v2__handle">@${user.username}</div>

          <div class="profile-head-v2__progress">
            <div class="profile-head-v2__progress-label">${arNum(prog.into)} / ${arNum(prog.step)}</div>
            <div class="progress progress--wide"><div class="progress__bar" style="width:${prog.ratio*100}%"></div></div>
          </div>

          ${isOwnProfile ? `<button class="btn btn-primary btn-sm" id="edit-profile-btn">${icon("feather", { size: 14 })}<span>تعديل الملف الشخصي</span></button>` : ""}
        </div>

        ${isOwnProfile ? `<div class="profile-section-tabs" role="tablist"><button class="${activeProfileSection==="profile"?"is-active":""}" data-profile-section="profile">ملفي الشخصي</button><button class="${activeProfileSection==="space"?"is-active":""}" data-profile-section="space">مساحتي</button></div>` : ""}

        <div class="profile-section-panel ${activeProfileSection==="profile"||!isOwnProfile?"":"is-hidden"}" data-profile-panel="profile">

        <div class="card profile-bio-card">
          <div class="profile-bio-card__head">${icon("document", { size: 16, cls: "heading-icon" })} نبذة العضو</div>
          <div class="profile-bio-card__body">
            <div class="profile-bio-card__text">
              ${user.bio ? `<p>${user.bio}</p>` : (isOwnProfile ? `<p class="text-muted">أضف نبذة عنك من زر التعديل أعلاه.</p>` : "")}
              ${user.socialUrl ? socialLinkPill(user.socialUrl) : ""}
            </div>
            ${miniStats.length ? `
              <div class="profile-bio-card__divider"></div>
              <div class="profile-bio-card__stats">${miniStats.join("")}</div>
            ` : ""}
          </div>
        </div>

        <div class="section-head">
          <h2>${icon("medal", { size: 20, cls: "heading-icon" })} الأوسمة</h2>
          <button class="btn btn-ghost btn-sm" id="toggle-badges-btn">${showAllBadges ? "عرض أقل" : "عرض جميع الأوسمة"}</button>
        </div>
        <div class="badge-hex-row" id="badges-grid">
          ${visibleBadges.map(renderBadgeCard).join("")}
        </div>

        <div class="card profile-streak-card">
          <div class="profile-streak-card__head">
            <div class="profile-streak-card__stat"><b>${arNum(activeDaysCount(user))}</b><span>${icon("flame", { size: 13 })} يومًا نشطًا</span></div>
            <div class="profile-streak-card__stat"><b>${arNum(user.longestStreak || 0)}</b><span>أطول سلسلة</span></div>
            <div class="profile-streak-card__stat"><b>${arNum(user.streak || 0)}</b><span>السلسلة الحالية</span></div>
          </div>
          ${heatmapGridHtml(user)}
        </div>

        ${recentActivity.length ? `
          <div class="section-head" style="margin-top:34px;"><h2>${icon("document", { size: 20, cls: "heading-icon" })} آخر ما نشره ${user.displayName}</h2></div>
          <div class="grid grid-3" id="recent-activity-grid">
            ${recentActivity.map(item => `
              <a href="${item.href}" class="card card--hover feed-item recent-activity-card">
                ${item.image ? `<div class="recent-activity-card__media"><img src="${item.image}" alt="" class="recent-activity-card__thumb"></div>` : ""}
                <span class="badge-pill badge-pill--gold" style="margin-bottom:8px;">${icon(item.ic, { size: 12 })}<span>${item.tag}</span></span>
                <h3 style="font-size:1rem;">${item.title}</h3>
              </a>
            `).join("")}
          </div>
          ${allRecentActivity.length > 3 ? `<button class="btn btn-outline btn-block" id="toggle-recent-activity">${showAllRecentActivity ? "عرض الأحدث فقط" : "رؤية المزيد"}</button>` : ""}
        ` : ""}
        </div>

        ${isOwnProfile ? `<div class="profile-section-panel ${activeProfileSection==="space"?"":"is-hidden"}" data-profile-panel="space">${personalSpaceHtml(user)}</div>` : ""}

      </div>
    </section>
  `;


  bindBadgeCards(root.querySelector("#badges-grid"), describedBadges);

  root.querySelector("#toggle-badges-btn").addEventListener("click", () => {
    showAllBadges = !showAllBadges;
    renderProfilePage(root, userId);
  });

  root.querySelector("#edit-profile-btn")?.addEventListener("click", () => openEditProfileModal(user, root, userId));
  root.querySelector("#toggle-recent-activity")?.addEventListener("click", () => { showAllRecentActivity = !showAllRecentActivity; renderProfilePage(root, userId); });
  root.querySelectorAll("[data-profile-section]").forEach(btn=>btn.addEventListener("click",()=>{activeProfileSection=btn.dataset.profileSection;renderProfilePage(root,userId);}));
  const rerender = () => renderProfilePage(root, userId);
  root.querySelector("#edit-personal-goals")?.addEventListener("click", () => openPersonalGoalsModal(user, rerender));
  root.querySelector("#new-private-draft")?.addEventListener("click", () => openDraftModal(user, null, rerender));
  root.querySelectorAll("[data-open-draft]").forEach(btn => btn.addEventListener("click", () => { const draft=store.getDrafts(user.id).find(d=>d.id===btn.dataset.openDraft); openDraftViewModal(draft,()=>openDraftModal(user,draft,rerender)); }));
  root.querySelectorAll("[data-edit-draft]").forEach(btn => btn.addEventListener("click", () => openDraftModal(user, store.getDrafts(user.id).find(d=>d.id===btn.dataset.editDraft), rerender)));
  root.querySelectorAll("[data-delete-draft]").forEach(btn => btn.addEventListener("click", () => { store.deleteDraft(user.id, btn.dataset.deleteDraft); showToast("حُذفت المسودة"); rerender(); }));
  root.querySelector("#new-private-book")?.addEventListener("click",()=>openPrivateBookModal(user,null,rerender));
  root.querySelectorAll("[data-open-private-book]").forEach(btn=>btn.addEventListener("click",()=>openPrivateBookView(store.getPersonalLibrary(user.id).find(b=>b.id===btn.dataset.openPrivateBook))));
  root.querySelectorAll("[data-edit-private-book]").forEach(btn=>btn.addEventListener("click",()=>openPrivateBookModal(user,store.getPersonalLibrary(user.id).find(b=>b.id===btn.dataset.editPrivateBook),rerender)));
  root.querySelectorAll("[data-delete-private-book]").forEach(btn=>btn.addEventListener("click",()=>{store.deletePersonalBook(user.id,btn.dataset.deletePrivateBook);showToast("حُذف الكتاب من مكتبتك");rerender();}));
}
