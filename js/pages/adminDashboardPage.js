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
import { showToast, bindParticipantLinks } from "../components/modals.js";
import { icon, initial } from "../components/icons.js";

let activeTab = "members";

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

function membersTab(current){
  const users = store.getUsers();
  return `
    <table class="admin-table">
      <thead><tr><th>العضو</th><th>الدور</th><th>المستوى</th><th>الخبرة</th><th>إجراء</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td style="display:flex;align-items:center;gap:8px;">
              <div class="avatar avatar--sm participant-link" data-user-id="${u.id}">${initial(u.displayName)}</div>
              <span class="participant-link" data-user-id="${u.id}">${u.displayName}</span>
            </td>
            <td><span class="badge-pill ${roleClass(u.role)}">${roleLabel(u.role)}</span></td>
            <td>${u.level}</td>
            <td>${u.xp} XP</td>
            <td>
              ${u.role === "owner" ? `<span class="text-muted" style="font-size:.8rem;">—</span>` :
                u.role === "moderator"
                ? `<button class="btn btn-ghost btn-sm" data-demote="${u.id}">إزالة الإشراف</button>`
                : `<button class="btn btn-outline btn-sm" data-promote="${u.id}">تعيين مشرفاً</button>`}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function submissionsTab(){
  const subs = store.getEventSubmissions().filter(s => s.status === "pending");
  if(!subs.length){
    return `<div class="empty-state"><div class="empty-state__icon">${icon("shield", { size: 28 })}</div><p>لا طلبات بانتظار الاعتماد حالياً.</p></div>`;
  }
  return `
    <table class="admin-table">
      <thead><tr><th>العضو</th><th>الفعالية</th><th>الوصف</th><th>إجراء</th></tr></thead>
      <tbody>
        ${subs.map(s => {
          const user = store.getUser(s.userId);
          const ev = store.getEvent(s.eventId);
          return `
            <tr>
              <td>${user?.displayName || "—"}</td>
              <td>${ev?.title || "—"}</td>
              <td style="max-width:260px;">${s.payload?.text || ""}</td>
              <td style="display:flex;gap:6px;">
                <button class="btn btn-primary btn-sm" data-approve="${s.id}">اعتماد</button>
                <button class="btn btn-danger btn-sm" data-reject="${s.id}">رفض</button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function contentTab(){
  const posts = store.getPosts();
  const reviews = store.getReviews();
  const events = store.getEvents();
  const pendingArticles = store.getArticleSubmissions().filter(s => s.status === "pending");
  return `
    ${pendingArticles.length ? `
    <h3 style="margin-bottom:12px;">مقالات بانتظار المراجعة</h3>
    <table class="admin-table" style="margin-bottom:26px;">
      <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
      <tbody>${pendingArticles.map(s => `
        <tr><td>${s.title}</td><td>${store.getUser(s.authorId)?.displayName || "—"}</td>
        <td style="display:flex;gap:6px;">
          <button class="btn btn-primary btn-sm" data-approve-article="${s.id}">اعتماد ونشر</button>
          <button class="btn btn-danger btn-sm" data-reject-article="${s.id}">رفض</button>
        </td></tr>
      `).join("")}</tbody>
    </table>` : ""}

    <h3 style="margin-bottom:12px;">المنشورات الأدبية</h3>
    ${posts.length ? `<table class="admin-table" style="margin-bottom:26px;">
      <thead><tr><th>العنوان</th><th>الكاتب</th><th>إجراء</th></tr></thead>
      <tbody>${posts.map(p => `
        <tr><td>${p.title}</td><td>${store.getUser(p.authorId)?.displayName || "—"}</td>
        <td><button class="btn btn-danger btn-sm" data-del-post="${p.id}">حذف</button></td></tr>
      `).join("")}</tbody>
    </table>` : `<p class="text-muted" style="margin-bottom:26px;">لا منشورات بعد.</p>`}

    <h3 style="margin-bottom:12px;">مراجعات القراءة</h3>
    ${reviews.length ? `<table class="admin-table" style="margin-bottom:26px;">
      <thead><tr><th>الكتاب</th><th>الكاتب</th><th>إجراء</th></tr></thead>
      <tbody>${reviews.map(r => `
        <tr><td>${r.bookTitle}</td><td>${store.getUser(r.authorId)?.displayName || "—"}</td>
        <td><button class="btn btn-danger btn-sm" data-del-review="${r.id}">حذف</button></td></tr>
      `).join("")}</tbody>
    </table>` : `<p class="text-muted" style="margin-bottom:26px;">لا مراجعات بعد.</p>`}

    <h3 style="margin-bottom:12px;">الفعاليات</h3>
    <table class="admin-table">
      <thead><tr><th>الفعالية</th><th>المشاركون</th><th>إجراء</th></tr></thead>
      <tbody>${events.map(e => `
        <tr><td>${e.title}</td><td>${e.participants.length}</td>
        <td><button class="btn btn-danger btn-sm" data-del-event="${e.id}">حذف</button></td></tr>
      `).join("")}</tbody>
    </table>
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
      </ul>
    </div>
  `;
}

const TABS = [
  { id: "members",     label: "الأعضاء",       ic: "users",   ownerOnly: false },
  { id: "submissions",  label: "طلبات الاعتماد",  ic: "shield",   ownerOnly: false },
  { id: "content",     label: "إدارة المحتوى",   ic: "document",  ownerOnly: false },
  { id: "settings",     label: "الإعدادات",     ic: "shield",   ownerOnly: true },
];

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
    members: () => membersTab(user),
    submissions: submissionsTab,
    content: contentTab,
    settings: settingsTab,
  };

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
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

  bindParticipantLinks(root.querySelector("#admin-tab-body"));

  root.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab");
      renderAdminDashboardPage(root);
    });
  });

  root.querySelectorAll("[data-promote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-promote"), { role: "moderator" });
    showToast("تم تعيين العضو مشرفاً");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-demote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-demote"), { role: "member" });
    showToast("أُزيلت صلاحية الإشراف");
    renderAdminDashboardPage(root);
  }));

  root.querySelectorAll("[data-approve]").forEach(btn => btn.addEventListener("click", () => {
    const sub = store.getEventSubmissions().find(s => s.id === btn.getAttribute("data-approve"));
    store.updateSubmissionStatus(sub.id, "approved");
    processActivity(sub.userId, "submit_event_proof", { eventId: sub.eventId });
    showToast("اعتُمدت المشاركة");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-reject]").forEach(btn => btn.addEventListener("click", () => {
    store.updateSubmissionStatus(btn.getAttribute("data-reject"), "rejected");
    showToast("رُفضت المشاركة");
    renderAdminDashboardPage(root);
  }));

  root.querySelectorAll("[data-del-post]").forEach(btn => btn.addEventListener("click", () => {
    store.deletePost(btn.getAttribute("data-del-post"));
    showToast("حُذف المنشور");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-del-review]").forEach(btn => btn.addEventListener("click", () => {
    store.deleteReview(btn.getAttribute("data-del-review"));
    showToast("حُذفت المراجعة");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-del-event]").forEach(btn => btn.addEventListener("click", () => {
    store.deleteEvent(btn.getAttribute("data-del-event"));
    showToast("حُذفت الفعالية");
    renderAdminDashboardPage(root);
  }));

  root.querySelectorAll("[data-approve-article]").forEach(btn => btn.addEventListener("click", () => {
    store.approveArticleSubmission(btn.getAttribute("data-approve-article"));
    showToast("اعتُمد المقال ونُشر");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-reject-article]").forEach(btn => btn.addEventListener("click", () => {
    store.rejectArticleSubmission(btn.getAttribute("data-reject-article"));
    showToast("رُفض المقال");
    renderAdminDashboardPage(root);
  }));
}
