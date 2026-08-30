/* =========================================================
   دوحة المداد — store.js
   محرك التخزين المحلي (LocalStorage) — قراءة/كتابة فورية
   وبثّ التغييرات لبقية أجزاء التطبيق (Pub/Sub بسيط)
   ========================================================= */

import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_ARTICLES, CURRENT_USER_ID, LEVEL_XP_STEP } from "./initialData.js";
import { dayKey } from "../services/streakService.js";

const DB_KEY = "dawha_almidad_db_v1";
const listeners = new Set();

function seedDB(){
  const currentYear = new Date().getFullYear();
  return {
    users: INITIAL_USERS,
    events: INITIAL_EVENTS,
    articles: INITIAL_ARTICLES,
    articleSubmissions: [], // مقالات مُرسلة من الأعضاء بانتظار مراجعة الإدارة
    posts: [],          // القطع الأدبية المنشورة في قسم الكتابة
    reviews: [],         // مراجعات القراءة
    userEvents: [],       // سجلّ الأحداث الخام (user_events)
    eventSubmissions: [], // طلبات إثبات المشاركة بالفعاليات (خصوصاً admin_verification)
    notifications: [],
    annualGoals: { [currentYear]: { words: 50000, events: 20, booksPublished: 10, booksRead: 60 } },
    currentUserId: CURRENT_USER_ID,
    meta: { createdAt: new Date().toISOString() }
  };
}

function load(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(!raw) throw new Error("empty");
    return JSON.parse(raw);
  }catch(e){
    const fresh = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

let db = load();

function persist(){
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  listeners.forEach(fn => { try{ fn(db); }catch(e){ console.error(e); } });
}

export const store = {
  /** يشترك مكوّن ما في التغييرات، يعيد دالة إلغاء الاشتراك */
  subscribe(fn){
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  raw(){ return db; },

  reset(){ db = seedDB(); persist(); },

  // ---------- المستخدمون ----------
  getUsers(){ return db.users; },
  getUser(id){ return db.users.find(u => u.id === id) || null; },
  getCurrentUser(){ return this.getUser(db.currentUserId); },
  setCurrentUser(id){ db.currentUserId = id; persist(); },
  updateUser(id, patch){
    const idx = db.users.findIndex(u => u.id === id);
    if(idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...patch };
    persist();
    return db.users[idx];
  },
  updateUserStats(id, statPatch){
    const u = this.getUser(id);
    if(!u) return null;
    u.stats = { ...u.stats, ...statPatch };
    persist();
    return u;
  },

  // ---------- الفعاليات ----------
  getEvents(){ return [...db.events].sort((a,b) => a.order - b.order); },
  createEvent(data){
    const item = {
      id: "ev_" + Date.now(),
      participants: [],
      order: db.events.length + 1,
      ...data
    };
    db.events.push(item);
    persist();
    return item;
  },
  getEvent(id){ return db.events.find(e => e.id === id) || null; },
  joinEvent(eventId, userId){
    const ev = this.getEvent(eventId);
    if(!ev) return null;
    if(!ev.participants.includes(userId)) ev.participants.push(userId);
    persist();
    return ev;
  },

  // ---------- المقالات ----------
  getArticles(){ return [...db.articles].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  getArticle(id){ return db.articles.find(a => a.id === id) || null; },

  /** إرسال مقال من عضو لمراجعة الإدارة قبل نشره */
  submitArticle({ authorId, title, category, content, images = [] }){
    const submission = {
      id: "as_" + Date.now(),
      authorId, title, category, content, images,
      status: "pending", // pending | approved | rejected
      submittedAt: new Date().toISOString()
    };
    db.articleSubmissions.push(submission);
    persist();
    return submission;
  },
  getArticleSubmissions(){ return db.articleSubmissions; },
  deleteArticle(id){ db.articles = db.articles.filter(a => a.id !== id); persist(); },
  approveArticleSubmission(id){
    const sub = db.articleSubmissions.find(s => s.id === id);
    if(!sub) return null;
    sub.status = "approved";
    db.articles.unshift({
      id: "ar_" + Date.now(), title: sub.title, category: sub.category,
      excerpt: sub.content.slice(0, 130), content: sub.content,
      author: sub.authorId, images: sub.images || [], date: new Date().toISOString()
    });
    persist();
    return sub;
  },
  rejectArticleSubmission(id){
    const sub = db.articleSubmissions.find(s => s.id === id);
    if(!sub) return null;
    sub.status = "rejected";
    persist();
    return sub;
  },

  // ---------- الكتابة (منشورات) ----------
  getPosts(){ return [...db.posts].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  addPost(post){
    const item = { id: "p_" + Date.now(), date: new Date().toISOString(), likedBy: [], comments: [], ...post };
    db.posts.unshift(item);
    persist();
    return item;
  },

  // ---------- القراءة (مراجعات) ----------
  getReviews(){ return [...db.reviews].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  addReview(review){
    const item = { id: "r_" + Date.now(), date: new Date().toISOString(), likedBy: [], comments: [], ...review };
    db.reviews.unshift(item);
    persist();
    return item;
  },

  /** إعجاب واحد فقط لكل مستخدم — الضغط مجدداً يُلغيه (toggle) */
  toggleLike(kind, itemId, userId){
    const list = kind === "post" ? db.posts : db.reviews;
    const item = list.find(i => i.id === itemId);
    if(!item) return null;
    item.likedBy = item.likedBy || [];
    const idx = item.likedBy.indexOf(userId);
    if(idx === -1) item.likedBy.push(userId);
    else item.likedBy.splice(idx, 1);
    persist();
    return item;
  },

  /**
   * إضافة تعليق أو ردّ على منشور/مراجعة. يحفظ العلاقة الحقيقية في
   * قاعدة البيانات: parentCommentId (الأب المباشر)، rootCommentId
   * (التعليق الأصلي لسلسلة الردود)، وdepth (للمنطق فقط، لا يُستخدم
   * لإجبار الواجهة على تداخل بصري لا نهائي).
   */
  addComment(kind, itemId, { userId, text, parentCommentId = null }){
    const list = kind === "post" ? db.posts : db.reviews;
    const item = list.find(i => i.id === itemId);
    if(!item) return null;
    item.comments = item.comments || [];

    let rootCommentId, depth;
    if(parentCommentId){
      const parent = item.comments.find(c => c.id === parentCommentId);
      if(!parent) return null; // لا نسمح بربط رد بتعليق غير موجود
      rootCommentId = parent.rootCommentId; // الجذر موروث دائماً من الأب
      depth = parent.depth + 1;
    }

    const comment = {
      id: "c_" + Date.now() + Math.random().toString(16).slice(2),
      userId, text,
      parentCommentId: parentCommentId || null,
      likedBy: [],
      date: new Date().toISOString()
    };
    comment.rootCommentId = parentCommentId ? rootCommentId : comment.id; // تعليق جذري يشير لنفسه
    comment.depth = parentCommentId ? depth : 0;

    item.comments.push(comment);
    persist();
    return comment;
  },

  /** إعجاب واحد فقط لكل مستخدم على أي تعليق — الضغط مجدداً يُلغيه */
  toggleCommentLike(kind, itemId, commentId, userId){
    const list = kind === "post" ? db.posts : db.reviews;
    const item = list.find(i => i.id === itemId);
    const comment = item?.comments?.find(c => c.id === commentId);
    if(!comment) return null;
    comment.likedBy = comment.likedBy || [];
    const idx = comment.likedBy.indexOf(userId);
    if(idx === -1) comment.likedBy.push(userId);
    else comment.likedBy.splice(idx, 1);
    persist();
    return comment;
  },

  deletePost(id){
    const post = db.posts.find(p => p.id === id);
    if(post) this.reverseActivity(post.authorId, {
      xp: 50, statField: "wordsWritten", statDelta: post.wordCount || 0,
      dateIso: post.date, extra: post.type === "chapter" ? { field: "booksPublished", delta: 1 } : null
    });
    db.posts = db.posts.filter(p => p.id !== id);
    persist();
  },
  deleteReview(id){
    const review = db.reviews.find(r => r.id === id);
    if(review) this.reverseActivity(review.authorId, { xp: 30, statField: "booksRead", statDelta: 1, dateIso: review.date });
    db.reviews = db.reviews.filter(r => r.id !== id);
    persist();
  },
  deleteEvent(id){
    const ev = db.events.find(e => e.id === id);
    if(ev){
      ev.participants.forEach(uid => {
        this.reverseActivity(uid, { xp: 15, statField: "challengesJoined", statDelta: 1, dateIso: new Date().toISOString() });
      });
      db.eventSubmissions.filter(s => s.eventId === id && s.status === "approved").forEach(s => {
        this.reverseActivity(s.userId, { xp: 40, statField: null, statDelta: 0, dateIso: s.submittedAt });
      });
      db.eventSubmissions = db.eventSubmissions.filter(s => s.eventId !== id);
    }
    db.events = db.events.filter(e => e.id !== id);
    persist();
  },

  /**
   * يعكس نشاطاً مؤهلاً محذوفاً: يسحب النقاط ويعيد حساب المستوى،
   * ينقص الإحصائية المرتبطة، وإن كان هذا آخر نشاط في يومه يُطفئ
   * شعلة ذلك اليوم ويُعاد حساب السلسلة الحالية/الأطول من جديد.
   */
  reverseActivity(userId, { xp = 0, statField = null, statDelta = 0, dateIso, extra = null }){
    const user = this.getUser(userId);
    if(!user) return;
    user.xp = Math.max(0, (user.xp || 0) - xp);
    user.level = Math.max(1, Math.floor(user.xp / LEVEL_XP_STEP) + 1);
    if(statField && user.stats[statField] != null){
      user.stats[statField] = Math.max(0, user.stats[statField] - statDelta);
    }
    if(extra && user.stats[extra.field] != null){
      user.stats[extra.field] = Math.max(0, user.stats[extra.field] - extra.delta);
    }
    const key = dayKey(dateIso);
    if(user.activityLog && user.activityLog[key]){
      user.activityLog[key] = Math.max(0, user.activityLog[key] - 1);
      if(user.activityLog[key] === 0) delete user.activityLog[key];
    }
    this.recomputeStreak(user);
  },

  /** يعيد حساب السلسلة الحالية/الأطول ومن آخر يوم نشِط من سجلّ النشاط بالكامل */
  recomputeStreak(user){
    const days = Object.keys(user.activityLog || {}).filter(k => user.activityLog[k] > 0).sort();
    if(!days.length){ user.streak = 0; user.lastActiveDate = null; return; }
    let longest = 1, run = 1;
    for(let i = 1; i < days.length; i++){
      const diff = Math.round((new Date(days[i]) - new Date(days[i-1])) / 86400000);
      run = diff === 1 ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
    let current = 1;
    for(let i = days.length - 1; i > 0; i--){
      const diff = Math.round((new Date(days[i]) - new Date(days[i-1])) / 86400000);
      if(diff === 1) current++; else break;
    }
    const lastDay = days[days.length - 1];
    const gapFromToday = Math.round((new Date(dayKey(new Date())) - new Date(lastDay)) / 86400000);
    user.streak = gapFromToday <= 1 ? current : 0;
    user.longestStreak = Math.max(user.longestStreak || 0, longest);
    user.lastActiveDate = lastDay;
  },

  // ---------- سجلّ الأحداث (user_events) ----------
  logUserEvent(userId, type, meta = {}){
    const event = { id: "ue_" + Date.now() + Math.random().toString(16).slice(2), userId, type, meta, timestamp: new Date().toISOString() };
    db.userEvents.push(event);
    persist();
    return event;
  },
  getUserEvents(userId){ return db.userEvents.filter(e => e.userId === userId); },

  // ---------- الأهداف السنوية (يضعها المالك أو المشرفون) ----------
  getAnnualGoal(year){ return db.annualGoals[year] || null; },
  setAnnualGoal(year, targets){
    db.annualGoals[year] = { ...(db.annualGoals[year] || {}), ...targets };
    persist();
    return db.annualGoals[year];
  },
  /** يحسب الإنجاز الفعلي لسنة معيّنة من سجلّ الأحداث الخام */
  computeYearActuals(year){
    const items = db.userEvents.filter(e => new Date(e.timestamp).getFullYear() === year);
    return {
      words: items.filter(e => e.type === "publish_post").reduce((s, e) => s + (e.meta.wordCount || 0), 0),
      events: items.filter(e => e.type === "join_event").length,
      booksPublished: items.filter(e => e.type === "publish_post" && e.meta.isFullWork).length,
      booksRead: items.filter(e => e.type === "publish_review").length,
    };
  },

  // ---------- طلبات اعتماد الفعاليات (admin_verification) ----------
  submitEventProof(eventId, userId, payload, { status = "pending", isPublic = false } = {}){
    const submission = {
      id: "sub_" + Date.now(),
      eventId, userId, payload,
      status, // pending | approved | rejected
      public: isPublic,
      submittedAt: new Date().toISOString()
    };
    db.eventSubmissions.push(submission);
    persist();
    return submission;
  },
  getEventSubmissions(){ return db.eventSubmissions; },
  updateSubmissionStatus(id, status){
    const s = db.eventSubmissions.find(s => s.id === id);
    if(!s) return null;
    s.status = status;
    s.resolvedAt = new Date().toISOString();
    persist();
    return s;
  },

  // ---------- الإشعارات ----------
  addNotification(userId, text, icon = "bell"){
    db.notifications.unshift({ id:"n_"+Date.now(), userId, text, icon, read:false, date:new Date().toISOString() });
    persist();
  },
  getNotifications(userId){ return db.notifications.filter(n => n.userId === userId); },
  markNotificationsRead(userId){
    db.notifications.forEach(n => { if(n.userId === userId) n.read = true; });
    persist();
  },

  /** حفظ عام بعد تعديلات مباشرة على db من خدمة أخرى (استخدام حذر) */
  commit(){ persist(); }
};

export function getDB(){ return db; }
