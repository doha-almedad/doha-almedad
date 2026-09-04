/* =========================================================
   دوحة المداد — badgeService.js
   خوارزمية الأوسمة: تحويل الشروط التقنية إلى صياغة أدبية
   فصيحة (قاعدة واجهة المستخدم: يُمنع كتابة الشروط بصيغة
   أوامر تقنية جافة مثل "اقرأ 10 كتب").
   ========================================================= */

import { BADGE_DEFINITIONS } from "../db/initialData.js";
import { store } from "../db/store.js";

function allDefinitions(){ const overrides=store.getBadgeOverrides(),disabled=new Set(store.getDisabledBadges());return [...BADGE_DEFINITIONS.filter(def=>!disabled.has(def.id)).map(def=>({...def,...(overrides[def.id]||{}),literaryDesc:{...def.literaryDesc,...(overrides[def.id]?.literaryDesc||{})}})), ...store.getCustomBadges()]; }

function currentValueFor(user, conditionType){
  switch(conditionType){
    case "wordsWritten": return user.stats.wordsWritten;
    case "booksRead": return user.stats.booksRead;
    case "challengesJoined": return user.stats.challengesJoined;
    case "articlesOrWorksPublished": return user.stats.articlesPublished + user.stats.booksPublished;
    case "longestStreak": return user.longestStreak || 0;
    case "level": return user.level || 1;
    default: return 0;
  }
}

export const badgeService = {
  /** كل تعريفات الأوسمة، للاستخدام في صفحة البروفايل */
  all(){ return allDefinitions(); },

  /** حالة وسام واحد بالنسبة لمستخدم: مفتوح/مقفل + النص الأدبي المناسب */
  describeForUser(user, def){
    const unlocked = !!(user.badges && user.badges[def.id]);
    const value = currentValueFor(user, def.conditionType);
    const text = unlocked ? def.literaryDesc.unlocked : def.literaryDesc.locked;
    return {
      ...def,
      unlocked,
      unlockedAt: unlocked ? user.badges[def.id].unlockedAt : null,
      progressValue: value,
      progressTarget: def.conditionValue,
      progressRatio: Math.min(1, value / def.conditionValue),
      text
    };
  },

  describeAllForUser(user){
    return allDefinitions().map(def => this.describeForUser(user, def));
  },

  /**
   * يفحص شروط كل الأوسمة بعد أي تحديث لإحصائيات العضو،
   * ويمنح الأوسمة الجديدة المستحقة. يعيد قائمة الأوسمة المفتوحة حديثاً.
   */
  checkAndAward(user){
    user.badges = user.badges || {};
    const newlyUnlocked = [];

    for(const def of allDefinitions()){
      const already = !!user.badges[def.id];
      if(already) continue;
      if((user.level || 1) < def.levelRequired) continue;

      const value = currentValueFor(user, def.conditionType);
      if(value >= def.conditionValue){
        user.badges[def.id] = { unlockedAt: new Date().toISOString() };
        newlyUnlocked.push(def);
      }
    }
    return newlyUnlocked;
  }
};
