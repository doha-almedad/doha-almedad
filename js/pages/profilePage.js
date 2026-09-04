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
      <div class="field-hint">يُعرض تلقائياً باسم المستخدم مع أيقونة المنصة.</div>
    </div>
    <button class="btn btn-primary btn-block" id="save-profile-btn">حفظ التغييرات</button>
  `, {
    onMount(box){
      const avatarPreview = box.querySelector("#avatar-edit-preview");
      box.querySelector("#edit-avatar-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        pendingAvatar = await cropImageFile(file, { aspectRatio:1, outputWidth:500, title:"قص صورة الأفتار" });
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

export function renderProfilePage(root, userId){
  const user = userId ? store.getUser(userId) : store.getCurrentUser();
  if(!user){
    root.innerHTML = `<div class="container section"><div class="empty-state">لم يُعثر على هذا العضو.</div></div>`;
    return;
  }
  const isOwnProfile = user.id === store.getCurrentUser().id;
  if(recentProfileId !== user.id){ recentProfileId = user.id; showAllRecentActivity = false; }
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
            <div class="profile-streak-card__stat"><b>${arNum(activeDaysCount(user))}</b><span>${icon("flame", { size: 13 })} يوماً نشطاً</span></div>
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
    </section>
  `;


  bindBadgeCards(root.querySelector("#badges-grid"), describedBadges);

  root.querySelector("#toggle-badges-btn").addEventListener("click", () => {
    showAllBadges = !showAllBadges;
    renderProfilePage(root, userId);
  });

  root.querySelector("#edit-profile-btn")?.addEventListener("click", () => openEditProfileModal(user, root, userId));
  root.querySelector("#toggle-recent-activity")?.addEventListener("click", () => { showAllRecentActivity = !showAllRecentActivity; renderProfilePage(root, userId); });
}
