/* =========================================================
   دوحة المداد — adminDashboardPage.js
   9. لوحة التحكم: مالك واحد بصلاحيات كاملة + مسؤولون (مشرفون)
   يختارهم المالك لإدارة المحتوى والتحقق من المشاركات.

   توزيع الصلاحيات:
   - المالك (owner، عضو واحد فقط): يملك كل صلاحيات المشرفين، إضافة
     إلى تعيين/إزالة المشرفين، وإدارة إعدادات المنصة العامة.
   - المشرفون (moderator، يختارهم المالك): نشر/حذف الفعاليات
     والمنشورات، مراجعة المقالات المُرسلة، واعتماد طلبات الفعاليات.
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast, bindParticipantLinks, openModal, closeModal } from "../components/modals.js";
import { icon, initial, arNum } from "../components/icons.js";
import { openEditPostModal } from "./writingPage.js";
import { cropImageFile } from "../services/mediaService.js";

let activeTab = "overview";

function roleLabel(role){
  if(role === "owner") return "المالك";
  if(role === "moderator") return "مشرف";
  return "عضو";
}
function roleClass(role){
  if(role === "owner") return "badge-pill--gold";
  if(role === "moderator") return "badge-pill--sage";
  return "";
}

function dashboardTab(){
  const users = store.getUsers();
  const events = store.getEvents();
  const posts = store.getPosts();
  const reviews = store.getReviews();
  const articles = store.getArticles();
  const pendingEvents = store.getEventSubmissions().filter(s => s.status === "pending");
  const pendingArticles = store.getArticleSubmissions().filter(s => s.status === "pending");
  const pendingTotal = pendingEvents.length + pendingArticles.length;

  return `
    <div class="admin-overview-head">
      <div>
        <span class="eyebrow">ملخص اليوم</span>
        <h2>نظرة عامة على المنصة</h2>
      </div>
    </div>

    <div class="grid grid-4 admin-overview-stats">
      <button class="card admin-metric" data-tab-target="members">
        <span>${icon("users", { size: 19 })}</span><b>${arNum(users.length)}</b><small>الأعضاء</small>
      </button>
      <button class="card admin-metric" data-tab-target="submissions">
        <span>${icon("target", { size: 19 })}</span><b>${arNum(pendingTotal)}</b><small>طلبات معلّقة</small>
      </button>
      <button class="card admin-metric" data-tab-target="content">
        <span>${icon("calendar", { size: 19 })}</span><b>${arNum(events.length)}</b><small>الفعاليات</small>
      </button>
      <button class="card admin-metric" data-tab-target="content">
        <span>${icon("document", { size: 19 })}</span><b>${arNum(posts.length + reviews.length + articles.length)}</b><small>إجمالي المحتوى</small>
      </button>
    </div>

    <div class="admin-overview-panel">
      <div>
        <h3>قائمة المراجعة</h3>
        <p class="text-muted">${pendingTotal ? `يوجد ${arNum(pendingTotal)} طلب يحتاج إلى قرار من الإدارة.` : "لا توجد طلبات معلّقة حاليًا."}</p>
      </div>
      <button class="btn btn-outline btn-sm" data-tab-target="submissions">فتح الطلبات</button>
    </div>
  `;
}

function membersTab(current){
  const users = store.getUsers();
  const canManage = current.role === "owner";
  return `
    <table class="admin-table">
      <thead><tr><th>العضو</th><th>الدور</th><th>المستوى</th><th>الخبرة</th>${canManage ? "<th>إجراء</th>" : ""}</tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td style="display:flex;align-items:center;gap:8px;">
              <div class="avatar avatar--sm participant-link" data-user-id="${u.id}">${initial(u.displayName)}</div>
              <span class="participant-link" data-user-id="${u.id}">${u.displayName}</span>
            </td>
            <td><span class="badge-pill ${roleClass(u.role)}">${roleLabel(u.role)}</span></td>
            <td>${arNum(u.level)}</td>
            <td>${arNum(u.xp)} XP</td>
            ${canManage ? `<td>
              ${u.role === "owner" ? `<span class="text-muted" style="font-size:.8rem;">—</span>` :
                u.role === "moderator"
                ? `<button class="btn btn-ghost btn-sm" data-demote="${u.id}">إزالة الإشراف</button>`
                : `<button class="btn btn-outline btn-sm" data-promote="${u.id}">تعيين مشرفاً</button>`}
            </td>` : ""}
          </tr>
        `).join("")}
      </tbody>
    </table>
    ${!canManage ? `<p class="text-muted" style="font-size:.8rem;margin-top:12px;">تعيين المشرفين وإزالتهم من صلاحيات المالك فقط.</p>` : ""}
  `;
}

function submissionsTab(){
  const subs = store.getEventSubmissions().filter(s => s.status === "pending");
  const pendingArticles = store.getArticleSubmissions().filter(s => s.status === "pending");

  if(!subs.length && !pendingArticles.length){
    return `<div class="empty-state"><div class="empty-state__icon">${icon("target", { size: 28 })}</div><p>لا طلبات بانتظار الاعتماد حالياً.</p></div>`;
  }

  return `
    ${pendingArticles.length ? `
    <h3 style="margin-bottom:12px;">مقالات بانتظار المراجعة</h3>
    <table class="admin-table" style="margin-bottom:30px;">
      <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
      <tbody>${pendingArticles.map(s => `
        <tr>
          <td><a href="#" data-preview-article="${s.id}">${s.title}</a></td>
          <td>${store.getUser(s.authorId)?.displayName || "—"}</td>
          <td style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" data-preview-article="${s.id}">قراءة</button>
            <button class="btn btn-primary btn-sm" data-approve-article="${s.id}">اعتماد ونشر</button>
            <button class="btn btn-danger btn-sm" data-reject-article="${s.id}">رفض</button>
          </td>
        </tr>
      `).join("")}</tbody>
    </table>` : ""}

    ${subs.length ? `
    <h3 style="margin-bottom:12px;">طلبات اعتماد الفعاليات</h3>
    <table class="admin-table">
      <thead><tr><th>العضو</th><th>الفعالية</th><th>إجراء</th></tr></thead>
      <tbody>
        ${subs.map(s => {
          const user = store.getUser(s.userId);
          const ev = store.getEvent(s.eventId);
          return `
            <tr>
              <td>${user?.displayName || "—"}</td>
              <td>${ev?.title || "—"}</td>
              <td style="display:flex;gap:6px;">
                <button class="btn btn-outline btn-sm" data-preview-submission="${s.id}">قراءة</button>
                <button class="btn btn-primary btn-sm" data-approve="${s.id}">اعتماد</button>
                <button class="btn btn-danger btn-sm" data-reject="${s.id}">رفض</button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>` : ""}
  `;
}

function contentTab(){
  const posts = store.getPosts();
  const reviews = store.getReviews();
  const events = store.getEvents();
  const articles = store.getArticles();
  return `
    <div class="admin-content-block">
      <div class="admin-content-block__head">
        <h3>الفعاليات</h3>
        <button class="btn btn-outline btn-sm" id="new-event-btn">${icon("plus", { size: 14 })}<span>فعالية جديدة</span></button>
      </div>
      ${events.length ? `<table class="admin-table">
        <thead><tr><th>الفعالية</th><th>المشاركون</th><th>إجراء</th></tr></thead>
        <tbody>${events.map(e => `
          <tr><td>${e.title}</td><td>${arNum(e.participants.length)}</td>
          <td style="display:flex;gap:6px;"><button class="btn btn-outline btn-sm" data-edit-event="${e.id}">تعديل</button><button class="btn btn-danger btn-sm" data-del-event="${e.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا فعاليات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>المنشورات الأدبية</h3>
      ${posts.length ? `<table class="admin-table">
        <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${posts.map(p => `
          <tr><td>${p.title}</td><td>${store.getUser(p.authorId)?.displayName || "—"}</td>
          <td style="display:flex;gap:6px;"><button class="btn btn-outline btn-sm" data-edit-post-admin="${p.id}">تعديل</button><button class="btn btn-danger btn-sm" data-del-post="${p.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا منشورات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>مراجعات القراءة</h3>
      ${reviews.length ? `<table class="admin-table">
        <thead><tr><th>الكتاب</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${reviews.map(r => `
          <tr><td>${r.bookTitle}</td><td>${store.getUser(r.authorId)?.displayName || "—"}</td>
          <td style="display:flex;gap:6px;"><button class="btn btn-outline btn-sm" data-edit-review="${r.id}">تعديل</button><button class="btn btn-danger btn-sm" data-del-review="${r.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا مراجعات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>المقالات المنشورة</h3>
      ${articles.length ? `<table class="admin-table">
        <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${articles.map(a => `
          <tr><td><a href="#" data-preview-published-article="${a.id}">${a.title}</a></td><td>${store.getUser(a.author)?.displayName || "—"}</td>
          <td style="display:flex;gap:6px;"><button class="btn btn-outline btn-sm" data-edit-article="${a.id}">تعديل</button><button class="btn btn-danger btn-sm" data-del-article="${a.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا مقالات منشورة بعد.</p>`}
    </div>
  `;
}

function editableImagesMarkup(images){
  return `<div class="field"><label>الصور</label><label class="image-upload"><span>${icon("image", {size:20})}<span>إضافة صور جديدة</span></span><input type="file" id="admin-edit-images" accept="image/*" multiple hidden></label><div id="admin-edit-image-list"></div></div>`;
}

function bindEditableImages(box, original, onSave){
  let images = [...(original.images || (original.image ? [original.image] : []))];
  const paint = () => {
    box.querySelector("#admin-edit-image-list").innerHTML = images.length ? `<div class="multi-image-strip">${images.map((src,i) => `<div class="multi-image-strip__item"><img src="${src}" alt=""><button type="button" class="multi-image-strip__remove" data-remove-admin-image="${i}">${icon("close", {size:9})}</button></div>`).join("")}</div>` : `<small class="text-muted">لا توجد صور</small>`;
    box.querySelectorAll("[data-remove-admin-image]").forEach(btn => btn.onclick = () => { images.splice(Number(btn.dataset.removeAdminImage),1); paint(); });
  };
  paint();
  box.querySelector("#admin-edit-images").onchange = async e => {
    for(const file of Array.from(e.target.files || [])) images.push(await cropImageFile(file, {aspectRatio:16/9, outputWidth:1200, title:"ضبط الصورة"}));
    paint();
  };
  onSave(() => images);
}

function openEditEventModal(id, refresh){
  const item = store.getEvent(id); if(!item) return;
  openModal(`<div class="modal-box__head"><h3>تعديل الفعالية</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div>
    <div class="field"><label>العنوان</label><input id="ae-title" value="${item.title}"></div><div class="field"><label>الوصف</label><textarea id="ae-desc">${item.description}</textarea></div>
    <div class="composer__meta"><div class="field"><label>البداية</label><input type="date" id="ae-start" value="${item.startDate?.slice(0,10)||""}"></div><div class="field"><label>النهاية</label><input type="date" id="ae-end" value="${item.endDate?.slice(0,10)||""}"></div></div>
    ${editableImagesMarkup(item.images)}<button class="btn btn-primary btn-block" id="ae-save">حفظ التعديلات</button>`, {size:"lg",onMount(box){ bindEditableImages(box,item,getImages => box.querySelector("#ae-save").onclick=()=>{ store.updateEvent(id,{title:box.querySelector("#ae-title").value.trim(),description:box.querySelector("#ae-desc").value.trim(),startDate:new Date(box.querySelector("#ae-start").value).toISOString(),endDate:new Date(box.querySelector("#ae-end").value).toISOString(),images:getImages(),image:null}); closeModal(); showToast("تم تعديل الفعالية"); refresh(); }); }});
}

function openEditReviewModal(id, refresh){
  const item = store.getReviews().find(r=>r.id===id); if(!item) return;
  openModal(`<div class="modal-box__head"><h3>تعديل سجل القراءة</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div>
    <div class="field"><label>عنوان الكتاب</label><input id="ar-book" value="${item.bookTitle}"></div><div class="field"><label>التقييم</label><select id="ar-rating">${[5,4,3,2,1].map(n=>`<option value="${n}" ${item.rating===n?"selected":""}>${n}</option>`).join("")}</select></div><div class="field"><label>المراجعة</label><textarea id="ar-content">${item.content}</textarea></div>
    ${editableImagesMarkup(item.images)}<button class="btn btn-primary btn-block" id="ar-save">حفظ التعديلات</button>`, {size:"lg",onMount(box){ bindEditableImages(box,item,getImages => box.querySelector("#ar-save").onclick=()=>{ store.updateReview(id,{bookTitle:box.querySelector("#ar-book").value.trim(),rating:Number(box.querySelector("#ar-rating").value),content:box.querySelector("#ar-content").value.trim(),images:getImages(),image:null}); closeModal(); showToast("تم تعديل سجل القراءة"); refresh(); }); }});
}

function openEditArticleModal(id, refresh){
  const item = store.getArticle(id); if(!item) return;
  openModal(`<div class="modal-box__head"><h3>تعديل المقال</h3><button class="modal-close" data-close>${icon("close",{size:18})}</button></div>
    <div class="field"><label>العنوان</label><input id="aa-title" value="${item.title}"></div><div class="field"><label>التصنيف</label><input id="aa-category" value="${item.category||""}"></div><div class="field"><label>وصف البطاقة</label><textarea id="aa-excerpt">${item.excerpt||""}</textarea></div><div class="field"><label>المحتوى</label><textarea id="aa-content">${item.content}</textarea></div>
    ${editableImagesMarkup(item.images)}<button class="btn btn-primary btn-block" id="aa-save">حفظ التعديلات</button>`, {size:"lg",onMount(box){ bindEditableImages(box,item,getImages => box.querySelector("#aa-save").onclick=()=>{ store.updateArticle(id,{title:box.querySelector("#aa-title").value.trim(),category:box.querySelector("#aa-category").value.trim(),excerpt:box.querySelector("#aa-excerpt").value.trim(),content:box.querySelector("#aa-content").value.trim(),images:getImages(),image:null}); closeModal(); showToast("تم تعديل المقال"); refresh(); }); }});
}

function settingsTab(){
  return `
    <div class="card card--flat">
      <h3>إعدادات عامة (المالك فقط)</h3>
      <p>تحكّم المالك في مسمّيات الأقسام، أسماء الأوسمة وقيم نقاطها، وقواعد احتساب الأنشطة يُدار حالياً من الكود مباشرة في <code>js/db/initialData.js</code> و<code>js/services/rewardEngine.js</code> — واجهة تعديل مباشرة لهذه القيم قيد الإعداد في نسخة قادمة.</p>
      <ul style="margin-top:12px;">
        <li class="text-muted">قاعدة اليوم النشط الواحد: نشاط مؤهل واحد أو أكثر في نفس اليوم = شعلة واحدة.</li>
        <li class="text-muted">التصفّح والإعجاب المجرد لا يُحتسبان ضمن الأنشطة المؤهلة.</li>
        <li class="text-muted">إعجاب واحد فقط لكل عضو على أي منشور أو مراجعة.</li>
        <li class="text-muted">حذف أي منشور أو فعالية يسحب معه النقاط والإحصائيات المرتبطة به تلقائياً.</li>
      </ul>
    </div>
  `;
}

function annualGoalsTab(){
  const year = new Date().getFullYear();
  const goal = store.getAnnualGoal(year) || { words:0, events:0, booksPublished:0, booksRead:0, articles:0 };
  const actual = store.computeYearActuals(year);
  const rows = [
    { key:"words", label:"الكلمات المكتوبة", ic:"quill", current:actual.words || 0, target:goal.words || 0 },
    { key:"events", label:"الفعاليات الأدبية", ic:"calendar", current:actual.events || 0, target:goal.events || 0 },
    { key:"booksPublished", label:"الكتب المنشورة", ic:"document", current:actual.booksPublished || 0, target:goal.booksPublished || 0 },
    { key:"booksRead", label:"الكتب المقروءة", ic:"book", current:actual.booksRead || 0, target:goal.booksRead || 0 },
    { key:"articles", label:"المقالات المنشورة", ic:"document", current:actual.articles || 0, target:goal.articles || 0 },
  ];
  return `
    <div class="admin-goals-head">
      <span class="eyebrow">خطة ${year}</span>
      <h2>أهداف الإنتاج السنوي</h2>
      <p class="text-muted">حدّد المستهدفات، وستعرض الرسوم نسبة الإنجاز الفعلية تلقائياً.</p>
    </div>
    <div class="admin-goals-form">
      ${rows.map(row => `<div class="field"><label>${icon(row.ic, { size:16 })}${row.label}</label><input type="number" min="0" id="annual-goal-${row.key}" value="${row.target}"></div>`).join("")}
    </div>
    <button class="btn btn-primary" id="save-annual-goals">حفظ الأهداف</button>
    <div class="admin-goal-chart" aria-label="رسوم تقدم الأهداف السنوية">
      ${rows.map(row => {
        const percent = row.target ? Math.min(100, Math.round((row.current / row.target) * 100)) : 0;
        return `<div class="admin-goal-row">
          <div class="admin-goal-row__labels"><span>${row.label}</span><b>${percent}٪</b></div>
          <div class="progress"><div class="progress__bar" style="width:${percent}%"></div></div>
          <small>${row.current.toLocaleString("ar")} من ${row.target.toLocaleString("ar")}</small>
        </div>`;
      }).join("")}
    </div>`;
}

const TABS = [
  { id: "overview",    label: "نظرة عامة",      ic: "home",    ownerOnly: false },
  { id: "members",     label: "الأعضاء",       ic: "users",   ownerOnly: false },
  { id: "submissions",  label: "طلبات الاعتماد",  ic: "target",   ownerOnly: false },
  { id: "content",     label: "إدارة المحتوى",   ic: "document",  ownerOnly: false },
  { id: "goals",       label: "الأهداف السنوية", ic: "chart",     ownerOnly: true },
  { id: "settings",     label: "الإعدادات",     ic: "lock",   ownerOnly: true },
];

function openNewEventModal(refresh){
  openModal(`
    <div class="modal-box__head"><h3>فعالية جديدة</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="field"><label>عنوان الفعالية</label><input type="text" id="ne-title" placeholder="اسم الفعالية"></div>
    <div class="field"><label>الوصف</label><textarea id="ne-desc" placeholder="وصف مختصر للفعالية"></textarea></div>
    <div class="composer__meta">
      <div class="field"><label>تاريخ البداية</label><input type="date" id="ne-start"></div>
      <div class="field"><label>تاريخ النهاية</label><input type="date" id="ne-end"></div>
    </div>
    <div class="field">
      <label>آلية الإثبات</label>
      <select id="ne-verify">
        <option value="automatic">تحقّق تلقائي</option>
        <option value="select_existing_content">اختيار من الأعمال المنشورة</option>
        <option value="manual_submission">إثبات خارجي</option>
        <option value="admin_verification">اعتماد إداري</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" id="ne-save">نشر الفعالية</button>
  `, {
    onMount(box){
      box.querySelector("#ne-save").addEventListener("click", () => {
        const title = box.querySelector("#ne-title").value.trim();
        const description = box.querySelector("#ne-desc").value.trim();
        const startDate = box.querySelector("#ne-start").value;
        const endDate = box.querySelector("#ne-end").value;
        const verificationMethod = box.querySelector("#ne-verify").value;
        if(!title || !description || !startDate || !endDate){
          showToast("يرجى تعبئة كل الحقول");
          return;
        }
        store.createEvent({
          title, description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          verificationMethod,
          goal: "custom", goalValue: 1,
          organizerId: store.getCurrentUser().id
        });
        document.querySelector("[data-close]")?.click();
        showToast("نُشرت الفعالية");
        refresh();
      });
    }
  });
}

function previewArticleSubmission(sub){
  openModal(`
    <div class="modal-box__head"><h3>${sub.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="badge-pill badge-pill--ember" style="margin-bottom:12px;display:inline-flex;">${sub.category}</div>
    ${sub.excerpt ? `<div class="card card--flat" style="margin-bottom:14px;"><b>وصف الموضوع</b><p style="margin:6px 0 0;">${sub.excerpt}</p></div>` : ""}
    <p style="white-space:pre-line;">${sub.content}</p>
  `, { size: "lg" });
}

function previewPublishedArticle(article){
  openModal(`
    <div class="modal-box__head"><h3>${article.title}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="badge-pill badge-pill--ember" style="margin-bottom:12px;display:inline-flex;">${article.category}</div>
    <p style="white-space:pre-line;">${article.content}</p>
  `, { size: "lg" });
}

function previewEventSubmission(sub){
  const user = store.getUser(sub.userId);
  const ev = store.getEvent(sub.eventId);
  openModal(`
    <div class="modal-box__head"><h3>مشاركة ${user?.displayName || "عضو"}</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div class="badge-pill badge-pill--gold" style="margin-bottom:12px;display:inline-flex;">${ev?.title || ""}</div>
    <p style="white-space:pre-line;">${sub.payload?.text || ""}</p>
  `, { size: "lg" });
}

export function renderAdminDashboardPage(root){
  const user = store.getCurrentUser();

  if(user.role !== "owner" && user.role !== "moderator"){
    root.innerHTML = `
      <div class="container section">
        <div class="empty-state">
          <div class="empty-state__icon">${icon("lock", { size: 30 })}</div>
          <p>هذه اللوحة مخصصة لمالك المنصة والمشرفين فقط.</p>
        </div>
      </div>`;
    return;
  }

  const visibleTabs = TABS.filter(t => !t.ownerOnly || user.role === "owner");
  if(!visibleTabs.find(t => t.id === activeTab)) activeTab = visibleTabs[0].id;

  const bodyMap = {
    overview: dashboardTab,
    members: () => membersTab(user),
    submissions: submissionsTab,
    content: contentTab,
    goals: annualGoalsTab,
    settings: settingsTab,
  };

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head admin-page-head">
          <div><span class="eyebrow">إدارة المنصة</span><h1>${icon("shield", { size: 26, cls: "heading-icon" })} لوحة التحكم الإدارية</h1></div>
          <span class="badge-pill ${roleClass(user.role)}">أنت: ${roleLabel(user.role)}</span>
        </div>
        <div class="admin-shell">
          <nav class="admin-nav">
            ${visibleTabs.map(t => `<button data-tab="${t.id}" class="${activeTab===t.id?"is-active":""}">${icon(t.ic, { size: 15 })}<span>${t.label}</span></button>`).join("")}
          </nav>
          <div class="card" id="admin-tab-body">
            ${bodyMap[activeTab]()}
          </div>
        </div>
      </div>
    </section>
  `;

  function refresh(){ renderAdminDashboardPage(root); }

  bindParticipantLinks(root.querySelector("#admin-tab-body"));

  root.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab");
      renderAdminDashboardPage(root);
    });
  });

  root.querySelectorAll("[data-tab-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab-target");
      renderAdminDashboardPage(root);
    });
  });

  root.querySelectorAll("[data-promote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-promote"), { role: "moderator" });
    showToast("تم تعيين العضو مشرفاً");
    refresh();
  }));
  root.querySelectorAll("[data-demote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-demote"), { role: "member" });
    showToast("أُزيلت صلاحية الإشراف");
    refresh();
  }));

  root.querySelectorAll("[data-approve]").forEach(btn => btn.addEventListener("click", () => {
    const sub = store.getEventSubmissions().find(s => s.id === btn.getAttribute("data-approve"));
    store.updateSubmissionStatus(sub.id, "approved");
    processActivity(sub.userId, "submit_event_proof", { eventId: sub.eventId });
    showToast("اعتُمدت المشاركة");
    refresh();
  }));
  root.querySelectorAll("[data-reject]").forEach(btn => btn.addEventListener("click", () => {
    store.updateSubmissionStatus(btn.getAttribute("data-reject"), "rejected");
    showToast("رُفضت المشاركة");
    refresh();
  }));

  root.querySelectorAll("[data-del-post]").forEach(btn => btn.addEventListener("click", () => {
    store.deletePost(btn.getAttribute("data-del-post"));
    showToast("حُذف المنشور، وسُحبت نقاطه وشعلته المرتبطة");
    refresh();
  }));
  root.querySelectorAll("[data-edit-post-admin]").forEach(btn => btn.addEventListener("click", () => {
    openEditPostModal(btn.getAttribute("data-edit-post-admin"), refresh, { admin:true });
  }));
  root.querySelectorAll("[data-edit-event]").forEach(btn => btn.addEventListener("click", () => openEditEventModal(btn.dataset.editEvent, refresh)));
  root.querySelectorAll("[data-edit-review]").forEach(btn => btn.addEventListener("click", () => openEditReviewModal(btn.dataset.editReview, refresh)));
  root.querySelectorAll("[data-edit-article]").forEach(btn => btn.addEventListener("click", () => openEditArticleModal(btn.dataset.editArticle, refresh)));
  root.querySelectorAll("[data-del-review]").forEach(btn => btn.addEventListener("click", () => {
    store.deleteReview(btn.getAttribute("data-del-review"));
    showToast("حُذفت المراجعة، وسُحبت نقاطها وشعلتها المرتبطة");
    refresh();
  }));
  root.querySelectorAll("[data-del-event]").forEach(btn => btn.addEventListener("click", () => {
    store.deleteEvent(btn.getAttribute("data-del-event"));
    showToast("حُذفت الفعالية، وسُحبت نقاط المشاركين المرتبطة بها");
    refresh();
  }));
  root.querySelectorAll("[data-del-article]").forEach(btn => btn.addEventListener("click", () => {
    store.deleteArticle?.(btn.getAttribute("data-del-article"));
    showToast("حُذف المقال");
    refresh();
  }));

  root.querySelectorAll("[data-approve-article]").forEach(btn => btn.addEventListener("click", () => {
    const subId = btn.getAttribute("data-approve-article");
    const sub = store.getArticleSubmissions().find(s => s.id === subId);
    store.approveArticleSubmission(subId);
    if(sub) processActivity(sub.authorId, "publish_article", {});
    showToast("اعتُمد المقال ونُشر");
    refresh();
  }));
  root.querySelectorAll("[data-reject-article]").forEach(btn => btn.addEventListener("click", () => {
    store.rejectArticleSubmission(btn.getAttribute("data-reject-article"));
    showToast("رُفض المقال");
    refresh();
  }));

  root.querySelectorAll("[data-preview-article]").forEach(el => el.addEventListener("click", (e) => {
    e.preventDefault();
    const sub = store.getArticleSubmissions().find(s => s.id === el.getAttribute("data-preview-article"));
    if(sub) previewArticleSubmission(sub);
  }));
  root.querySelectorAll("[data-preview-published-article]").forEach(el => el.addEventListener("click", (e) => {
    e.preventDefault();
    const article = store.getArticles().find(a => a.id === el.getAttribute("data-preview-published-article"));
    if(article) previewPublishedArticle(article);
  }));
  root.querySelectorAll("[data-preview-submission]").forEach(btn => btn.addEventListener("click", () => {
    const sub = store.getEventSubmissions().find(s => s.id === btn.getAttribute("data-preview-submission"));
    if(sub) previewEventSubmission(sub);
  }));

  root.querySelector("#new-event-btn")?.addEventListener("click", () => openNewEventModal(refresh));
  root.querySelector("#save-annual-goals")?.addEventListener("click", () => {
    const year = new Date().getFullYear();
    const value = key => Math.max(0, Number(root.querySelector(`#annual-goal-${key}`)?.value) || 0);
    store.setAnnualGoal(year, {
      words:value("words"), events:value("events"),
      booksPublished:value("booksPublished"), booksRead:value("booksRead"),
      articles:value("articles")
    });
    showToast("حُفظت أهداف الإنتاج السنوي");
    refresh();
  });
}
