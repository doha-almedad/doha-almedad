/* =========================================================
   دوحة المداد — adminDashboardPage.js
   9. لوحة التحكم: إدارة المالكين المعددين للقواعد والأعضاء
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast } from "../components/modals.js";

let activeTab = "members";

function membersTab(){
  const users = store.getUsers();
  return `
    <table class="admin-table">
      <thead><tr><th>العضو</th><th>الدور</th><th>المستوى</th><th>الخبرة</th><th>إجراء</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td style="display:flex;align-items:center;gap:8px;"><div class="avatar avatar--sm">${u.avatarEmoji}</div> ${u.displayName}</td>
            <td><span class="badge-pill ${u.role==="owner"?"badge-pill--gold":""}">${u.role === "owner" ? "مالك" : "عضو"}</span></td>
            <td>${u.level}</td>
            <td>${u.xp} XP</td>
            <td>
              ${u.role === "owner"
                ? `<button class="btn btn-ghost btn-sm" data-demote="${u.id}">إزالة صلاحية المالك</button>`
                : `<button class="btn btn-outline btn-sm" data-promote="${u.id}">ترقية إلى مالك</button>`}
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
    return `<div class="empty-state"><div class="empty-state__icon">🛡️</div><p>لا طلبات بانتظار الاعتماد حالياً.</p></div>`;
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

function rulesTab(){
  return `
    <div class="card">
      <h3>القواعد العامة (عرض توضيحي)</h3>
      <p>يمكن للمالكين تعديل قواعد احتساب النقاط وشروط الأوسمة من هنا في نسخة الإنتاج الكاملة. تُدار هذه القيم حالياً من <code>js/db/initialData.js</code> و<code>js/services/rewardEngine.js</code>.</p>
      <ul style="margin-top:12px;">
        <li class="text-muted">قاعدة اليوم النشط الواحد: نشاط مؤهل واحد أو أكثر في نفس اليوم = شعلة واحدة.</li>
        <li class="text-muted">التصفّح والإعجاب المجرد لا يُحتسبان ضمن الأنشطة المؤهلة.</li>
      </ul>
    </div>
  `;
}

export function renderAdminDashboardPage(root){
  const user = store.getCurrentUser();

  if(user.role !== "owner"){
    root.innerHTML = `
      <div class="container section">
        <div class="empty-state">
          <div class="empty-state__icon">🔒</div>
          <p>هذه اللوحة مخصصة لمالكي المنصة فقط.</p>
        </div>
      </div>`;
    return;
  }

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">إدارة المنصة</span><h1>لوحة تحكم المالكين</h1></div></div>
        <div class="admin-shell">
          <nav class="admin-nav">
            <button data-tab="members" class="${activeTab==="members"?"is-active":""}">👥 الأعضاء</button>
            <button data-tab="submissions" class="${activeTab==="submissions"?"is-active":""}">🛡️ طلبات الاعتماد</button>
            <button data-tab="rules" class="${activeTab==="rules"?"is-active":""}">⚖️ القواعد</button>
          </nav>
          <div class="card" id="admin-tab-body">
            ${activeTab === "members" ? membersTab() : activeTab === "submissions" ? submissionsTab() : rulesTab()}
          </div>
        </div>
      </div>
    </section>
  `;

  root.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab");
      renderAdminDashboardPage(root);
    });
  });

  root.querySelectorAll("[data-promote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-promote"), { role: "owner" });
    showToast("تمت الترقية إلى مالك");
    renderAdminDashboardPage(root);
  }));
  root.querySelectorAll("[data-demote]").forEach(btn => btn.addEventListener("click", () => {
    store.updateUser(btn.getAttribute("data-demote"), { role: "member" });
    showToast("أُزيلت صلاحية المالك");
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
}
