/* =========================================================
   دوحة المداد — streakService.js
   خوارزمية «شعلة الحماسة»: يوم نشط واحد = شعلة واحدة،
   بصرف النظر عن عدد الأنشطة المؤهلة في نفس اليوم.
   ========================================================= */

function dayKey(date){
  return new Date(date).toISOString().slice(0, 10); // YYYY-MM-DD
}

function daysBetween(a, b){
  const A = new Date(dayKey(a));
  const B = new Date(dayKey(b));
  return Math.round((B - A) / 86400000);
}

export const streakService = {
  /**
   * تُستدعى عند كل نشاط أدبي مؤهل. تطبّق «قاعدة اليوم النشط الواحد»:
   * أول نشاط مؤهل في اليوم يُحرّك الشعلة، وأي نشاط إضافي في نفس
   * اليوم يُحتسب فقط ضمن خريطة الكثافة (Heatmap) لا في تكرار الشعلة.
   */
  registerActivity(user, when = new Date()){
    const today = dayKey(when);
    user.activityLog = user.activityLog || {};
    const isFirstActivityToday = !user.activityLog[today];

    user.activityLog[today] = (user.activityLog[today] || 0) + 1;

    if(isFirstActivityToday){
      if(!user.lastActiveDate){
        user.streak = 1;
      }else{
        const gap = daysBetween(user.lastActiveDate, today);
        if(gap === 1) user.streak = (user.streak || 0) + 1;
        else if(gap === 0) { /* لا يحدث نظرياً لأن isFirstActivityToday=true */ }
        else user.streak = 1; // انقطعت السلسلة
      }
      user.lastActiveDate = today;
      user.longestStreak = Math.max(user.longestStreak || 0, user.streak);
    }

    return user;
  },

  /** تتحقق مما إذا كانت الشعلة الحالية للمستخدم قد انطفأت (لعرض تنبيه لطيف) */
  isStreakAtRisk(user){
    if(!user.lastActiveDate) return false;
    const gap = daysBetween(user.lastActiveDate, dayKey(new Date()));
    return gap === 1; // لم ينشط اليوم بعد، وسينكسر إن انتهى اليوم بلا نشاط
  },

  /** يبني بيانات آخر 84 يوماً لخريطة بقع الحبر (Heatmap) */
  buildHeatmapCells(user, days = 84){
    const cells = [];
    const now = new Date();
    for(let i = days - 1; i >= 0; i--){
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const count = (user.activityLog && user.activityLog[key]) || 0;
      const level = count === 0 ? 0 : Math.min(4, count);
      cells.push({ date: key, count, level });
    }
    return cells;
  }
};
