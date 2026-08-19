/* =========================================================
   دوحة المداد — leaderboardPage.js
   5. قسم الإحصائيات: قائمة المتصدرين والإحصائيات العامة
   ========================================================= */

import { store } from "../db/store.js";
import { getLeaderboard } from "../services/rewardEngine.js";

export function renderLeaderboardPage(root){
  const ranked = getLeaderboard();
  const totalWords = store.getUsers().reduce((s,u) => s + u.stats.wordsWritten, 0);
  const totalBooks = store.getUsers().reduce((s,u) => s + u.stats.booksRead, 0);
  const totalEvents = store.getEvents().length;

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">مرآة المجتمع</span><h1>لوحة المتصدرين والإحصائيات</h1></div>
        </div>

        <div class="grid grid-3" style="margin-bottom:34px;">
          <div class="card stat-box"><b>${totalWords.toLocaleString("ar")}</b><span>كلمة مكتوبة في الدوحة</span></div>
          <div class="card stat-box"><b>${totalBooks.toLocaleString("ar")}</b><span>كتاب أُنهيت قراءته</span></div>
          <div class="card stat-box"><b>${totalEvents}</b><span>فعالية أدبية أُقيمت</span></div>
        </div>

        <div class="card">
          ${ranked.map((u, i) => `
            <div class="leader-row ${i===0?"leader-row--top1":i===1?"leader-row--top2":i===2?"leader-row--top3":""}">
              <div class="leader-row__rank">${i+1}</div>
              <div class="leader-row__user">
                <div class="avatar avatar--sm">${u.avatarEmoji}</div>
                <div>
                  <div>${u.displayName}</div>
                  <div class="text-muted" style="font-size:.78rem;">${u.literaryTitle} · المستوى ${u.level}</div>
                </div>
              </div>
              <div class="leader-row__xp">${u.xp} XP</div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}
