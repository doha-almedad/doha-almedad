/* =========================================================
   دوحة المداد — rewardEngine.js
   المحرك المنظّم (Orchestrator) — يقابل في هذا التطبيق
   الطرفي (client-side) خط الأنابيب الموصوف في المواصفات:
   Event Occurs → Event Service → Reward Engine →
   [Statistics | Achievement | Reputation | Streak | Leaderboard | Notification]
   ========================================================= */

import { store } from "../db/store.js";
import { streakService, dayKey } from "./streakService.js";
import { badgeService } from "./badgeService.js";
import { LEVEL_XP_STEP, LEVELS } from "../db/initialData.js";

/** الأنشطة المؤهلة فقط تُحتسب — التصفّح والإعجاب المجرد لا يُحتسبان إطلاقاً */
export const ACTIVITY_CONFIG = {
  publish_post:      { xp: 50, label: "نشر قطعة أدبية", statField: "wordsWritten", statFromMeta: "wordCount" },
  publish_review:     { xp: 30, label: "تسجيل قراءة فعلية", statField: "booksRead", statIncrement: 1 },
  join_event:        { xp: 15, label: "المشاركة في تحدٍّ",  statField: "challengesJoined", statIncrement: 1 },
  submit_event_proof:{ xp: 40, label: "إرسال إثبات مشاركة لفعالية", statField: "challengesJoined", statIncrement: 0 },
  publish_article:    { xp: 45, label: "نشر مقال", statField: "articlesPublished", statIncrement: 1 },
  literary_comment:   { xp: 10, label: "التعليق الأدبي النافع", statField: null }
};

function xpToLevel(xp){
  const points = Math.max(0, Number(xp) || 0);
  return [...LEVELS].reverse().find(l => points >= l.xp)?.level || 1;
}

/**
 * نقطة الدخول الوحيدة لأي نشاط مؤهل في المنصة.
 * @param {string} userId
 * @param {keyof ACTIVITY_CONFIG} activityType
 * @param {object} meta بيانات إضافية (عدد الكلمات، معرّف الفعالية...)
 */
export function processActivity(userId, activityType, meta = {}){
  const config = ACTIVITY_CONFIG[activityType];
  if(!config) throw new Error("نشاط غير معروف: " + activityType);

  const user = store.getUser(userId);
  if(!user) return null;

  // 1) Event Service — تسجيل الحدث في السجلّ الدائم
  store.logUserEvent(userId, activityType, meta);

  // 2) Statistics Service — تحديث الإحصائيات المباشرة
  if(config.statField){
    const inc = config.statIncrement ?? (meta[config.statFromMeta] || 0);
    user.stats[config.statField] = (user.stats[config.statField] || 0) + inc;
  }
  if(activityType === "publish_post" && meta.isFullWork){
    user.stats.booksPublished = (user.stats.booksPublished || 0) + 1;
  }
  if(activityType === "publish_post" && meta.isArticle){
    user.stats.articlesPublished = (user.stats.articlesPublished || 0) + 1;
  }

  // 3) Streak Service — تحديث شعلة الحماسة وخريطة النشاط
  const todayKey = dayKey(new Date());
  const wasActiveToday = (user.activityLog && user.activityLog[todayKey]) > 0;
  streakService.registerActivity(user, new Date());
  const streakJustIgnitedToday = !wasActiveToday;

  // 4) Reputation Service — تحديث النقاط والمستوى
  const awardedXp = Math.max(0, Number(store.getSettings().activityPoints?.[activityType] ?? config.xp));
  user.xp = (user.xp || 0) + awardedXp;
  const previousLevel = user.level || 1;
  user.level = xpToLevel(user.xp);
  const leveledUp = user.level > previousLevel;

  // 5) Achievement Service — فحص ومنح الأوسمة
  const newBadges = badgeService.checkAndAward(user);

  // حفظ كل التعديلات على العضو دفعة واحدة
  store.updateUser(userId, user);

  // 6) Leaderboard Service — تُحسب عند الطلب مباشرة من بيانات المستخدمين (getLeaderboard)

  // 7) Notification Service
  store.addNotification(userId, `+${awardedXp} نقطة — ${config.label}`, "star");
  if(streakJustIgnitedToday) store.addNotification(userId, "أُشعلت شعلة حماستك اليوم", "flame");
  if(leveledUp) store.addNotification(userId, `ترقّيت إلى المستوى ${user.level}`, "shield");
  newBadges.forEach(b => store.addNotification(userId, `وسام جديد: ${b.name}`, b.icon));

  return { user, leveledUp, newBadges, xpGained: awardedXp };
}

/** لوحة المتصدرين: ترتيب الأعضاء حسب نقاط الخبرة */
export function getLeaderboard(){
  return [...store.getUsers()].sort((a, b) => b.xp - a.xp);
}

export function xpProgressWithinLevel(user){
  const points = Math.max(0, Number(user.xp) || 0);
  const current = [...LEVELS].reverse().find(l => points >= l.xp) || LEVELS[0];
  const next = LEVELS.find(l => l.xp > points) || null;
  if(!next) return { into: points-current.xp, step: 0, ratio: 1, current, next: null };
  const span = next.xp-current.xp;
  const into = points-current.xp;
  return { into, step: span, ratio: Math.max(0,Math.min(1,into/span)), current, next };
}
