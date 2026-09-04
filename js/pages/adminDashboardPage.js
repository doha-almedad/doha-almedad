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
import { showToast, bindParticipantLinks, openModal } from "../components/modals.js";
import { icon, initial, arNum } from "../components/icons.js";

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
          <td><button class="btn btn-danger btn-sm" data-del-event="${e.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا فعاليات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>المنشورات الأدبية</h3>
      ${posts.length ? `<table class="admin-table">
        <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${posts.map(p => `
          <tr><td>${p.title}</td><td>${store.getUser(p.authorId)?.displayName || "—"}</td>
          <td><button class="btn btn-danger btn-sm" data-del-post="${p.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا منشورات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>مراجعات القراءة</h3>
      ${reviews.length ? `<table class="admin-table">
        <thead><tr><th>الكتاب</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${reviews.map(r => `
          <tr><td>${r.bookTitle}</td><td>${store.getUser(r.authorId)?.displayName || "—"}</td>
          <td><button class="btn btn-danger btn-sm" data-del-review="${r.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا مراجعات بعد.</p>`}
    </div>

    <div class="admin-content-block">
      <h3>المقالات المنشورة</h3>
      ${articles.length ? `<table class="admin-table">
        <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
        <tbody>${articles.map(a => `
          <tr><td><a href="#" data-preview-published-article="${a.id}">${a.title}</a></td><td>${store.getUser(a.author)?.displayName || "—"}</td>
          <td><button class="btn btn-danger btn-sm" data-del-article="${a.id}">حذف</button></td></tr>
        `).join("")}</tbody>
      </table>` : `<p class="text-muted">لا مقالات منشورة بعد.</p>`}
    </div>
  `;
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

const TABS = [
  { id: "overview",    label: "نظرة عامة",      ic: "home",    ownerOnly: false },
  { id: "members",     label: "الأعضاء",       ic: "users",   ownerOnly: false },
  { id: "submissions",  label: "طلبات الاعتماد",  ic: "target",   ownerOnly: false },
  { id: "content",     label: "إدارة المحتوى",   ic: "document",  ownerOnly: false },
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
}
