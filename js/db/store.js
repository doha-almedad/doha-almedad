/* =========================================================
   دوحة المداد — store.js
   محرك التخزين المحلي (LocalStorage) — قراءة/كتابة فورية
   وبثّ التغييرات لبقية أجزاء التطبيق (Pub/Sub بسيط)
   ========================================================= */

import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_ARTICLES, CURRENT_USER_ID, LEVEL_XP_STEP } from "./initialData.js";
import { dayKey } from "../services/streakService.js";

const DB_KEY = "dawha_almidad_db_v1";
const listeners = new Set();
const DEFAULT_SETTINGS = {
  sectionNames:{ home:"الرئيسية", events:"الفعاليات", writing:"الكتابة", reading:"القراءة", articles:"المقالات", admin:"الإدارة", profile:"ملفي الشخصي" },
  activityPoints:{ publish_post:50, publish_review:30, join_event:15, submit_event_proof:40, publish_article:45, literary_comment:10 }
};

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
    annualGoals: { [currentYear]: { words: 50000, events: 20, booksPublished: 10, booksRead: 60, articles: 24 } },
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
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

// ترحيل البيانات الأولية الجديدة إلى قواعد المتصفحات القديمة دون حذف محتوى المستخدم.
// مثال: عند إضافة عضو تجريبي جديد إلى INITIAL_USERS سيظهر أيضًا لمن سبق أن فتح الموقع.
const existingUserIds = new Set((db.users || []).map(user => user.id));
const missingInitialUsers = INITIAL_USERS.filter(user => !existingUserIds.has(user.id));
if(missingInitialUsers.length){
  db.users = [...(db.users || []), ...missingInitialUsers.map(user => JSON.parse(JSON.stringify(user)))];
}
// مزامنة أسماء الحسابات التجريبية مع النسخة الحالية دون تغيير المعرّفات أو المحتوى المرتبط بها.
for(const initialUser of INITIAL_USERS){
  const existing = (db.users || []).find(user => user.id === initialUser.id);
  if(existing){
    existing.displayName = initialUser.displayName;
    existing.username = initialUser.username;
    existing.role = initialUser.role;
  }
}
db.personalGoals = db.personalGoals || {};
db.drafts = db.drafts || [];
db.customBadges = db.customBadges || [];
db.personalLibrary = db.personalLibrary || [];
db.badgeOverrides = db.badgeOverrides || {};
db.disabledBadges = db.disabledBadges || [];
db.personalLibrary = (db.personalLibrary || []).map((book,index)=>book.id?book:{...book,id:`pbook_recovered_${index}_${Date.now()}`});
db.settings = { ...DEFAULT_SETTINGS, ...(db.settings||{}), sectionNames:{...DEFAULT_SETTINGS.sectionNames,...(db.settings?.sectionNames||{})}, activityPoints:{...DEFAULT_SETTINGS.activityPoints,...(db.settings?.activityPoints||{})} };
localStorage.setItem(DB_KEY, JSON.stringify(db));

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

  getSettings(){ return JSON.parse(JSON.stringify(db.settings)); },
  updateSettings(patch){ db.settings={...db.settings,...patch,sectionNames:{...db.settings.sectionNames,...(patch.sectionNames||{})},activityPoints:{...db.settings.activityPoints,...(patch.activityPoints||{})}};persist();return this.getSettings(); },

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

  // ---------- المساحة الشخصية الخاصة ----------
  getPersonalGoals(userId){ return db.personalGoals[userId] || { sections:[] }; },
  setPersonalGoals(userId, goals){ db.personalGoals[userId] = { ...goals, updatedAt:new Date().toISOString() }; persist(); return db.personalGoals[userId]; },
  getDrafts(userId){ return db.drafts.filter(d => d.userId === userId).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)); },
  saveDraft(userId, data){
    const now = new Date().toISOString();
    if(data.id){
      const item = db.drafts.find(d => d.id === data.id && d.userId === userId);
      if(!item) return null;
      Object.assign(item, data, { updatedAt:now }); persist(); return item;
    }
    const item = { id:"draft_"+Date.now(), userId, title:data.title, type:data.type || "piece", content:data.content || "", createdAt:now, updatedAt:now };
    db.drafts.push(item); persist(); return item;
  },
  deleteDraft(userId, id){ db.drafts = db.drafts.filter(d => !(d.id === id && d.userId === userId)); persist(); },
  getPersonalLibrary(userId){ return db.personalLibrary.filter(b=>b.userId===userId).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)); },
  savePersonalBook(userId, data){ const now=new Date().toISOString(); if(data.id){const item=db.personalLibrary.find(b=>b.id===data.id&&b.userId===userId);if(!item)return null;Object.assign(item,data,{updatedAt:now});persist();return item;}const {id:unusedId,...bookData}=data;const item={id:"pbook_"+Date.now(),userId,...bookData,createdAt:now,updatedAt:now};db.personalLibrary.push(item);persist();return item; },
  deletePersonalBook(userId,id){ db.personalLibrary=db.personalLibrary.filter(b=>!(b.id===id&&b.userId===userId));persist(); },

  // ---------- الأوسمة المرنة التي تنشئها الإدارة ----------
  getCustomBadges(){ return [...db.customBadges]; },
  addCustomBadge(data){ const item={ id:"badge_"+Date.now(), levelRequired:1, ...data, createdAt:new Date().toISOString() }; db.customBadges.push(item); persist(); return item; },
  updateCustomBadge(id,data){ const item=db.customBadges.find(b=>b.id===id);if(!item)return null;Object.assign(item,data,{editedAt:new Date().toISOString()});persist();return item; },
  getBadgeOverrides(){ return {...db.badgeOverrides}; },
  getDisabledBadges(){ return [...db.disabledBadges]; },
  updateBadgeDefinition(id,data){ const custom=db.customBadges.find(b=>b.id===id);if(custom)return this.updateCustomBadge(id,data);db.badgeOverrides[id]={...(db.badgeOverrides[id]||{}),...data,editedAt:new Date().toISOString()};persist();return {id,...db.badgeOverrides[id]}; },
  deleteCustomBadge(id){ db.customBadges=db.customBadges.filter(b=>b.id!==id); db.users.forEach(u=>{ if(u.badges) delete u.badges[id]; }); persist(); },
  deleteBadgeDefinition(id){ const custom=db.customBadges.some(b=>b.id===id);if(custom)return this.deleteCustomBadge(id);db.disabledBadges=[...new Set([...db.disabledBadges,id])];persist(); },

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
  updateEvent(id, patch){
    const item = db.events.find(e => e.id === id);
    if(!item) return null;
    Object.assign(item, patch, { editedAt:new Date().toISOString() }); persist(); return item;
  },
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
  getArticleReaders(articleId){ return db.users.filter(u => (u.readArticleIds || []).includes(articleId)); },
  updateArticle(id, patch){
    const item = db.articles.find(a => a.id === id);
    if(!item) return null;
    Object.assign(item, patch, { editedAt:new Date().toISOString() }); persist(); return item;
  },

  /** إرسال مقال من عضو لمراجعة الإدارة قبل نشره */
  submitArticle({ authorId, title, category, excerpt, content, images = [] }){
    const submission = {
      id: "as_" + Date.now(),
      authorId, title, category, excerpt, content, images,
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
      excerpt: sub.excerpt || sub.content.slice(0, 130), content: sub.content,
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
  updatePost(id, patch){
    const post = db.posts.find(p => p.id === id);
    if(!post) return null;
    if(Number.isFinite(patch.wordCount)){
      const author = db.users.find(u => u.id === post.authorId);
      if(author) author.stats.wordsWritten = Math.max(0, (author.stats.wordsWritten || 0) + patch.wordCount - (post.wordCount || 0));
    }
    Object.assign(post, patch, { editedAt: new Date().toISOString() });
    persist();
    return post;
  },

  // ---------- القراءة (مراجعات) ----------
  getReviews(){ return [...db.reviews].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  addReview(review){
    const item = { id: "r_" + Date.now(), date: new Date().toISOString(), likedBy: [], comments: [], ...review };
    db.reviews.unshift(item);
    persist();
    return item;
  },
  updateReview(id, patch){
    const item = db.reviews.find(r => r.id === id);
    if(!item) return null;
    Object.assign(item, patch, { editedAt:new Date().toISOString() }); persist(); return item;
  },
  markArticleRead(userId,articleId){ const u=this.getUser(userId);if(!u)return;u.readArticleIds=[...new Set([...(u.readArticleIds||[]),articleId])];persist(); },

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

  updateComment(kind, itemId, commentId, text, actorId){
    const list = kind === "post" ? db.posts : db.reviews;
    const item = list.find(i => i.id === itemId);
    const comment = item?.comments?.find(c => c.id === commentId);
    const actor = db.users.find(u => u.id === actorId);
    const allowed = comment && (comment.userId === actorId || actor?.role === "owner" || actor?.role === "moderator");
    if(!allowed || !text?.trim()) return null;
    comment.text = text.trim();
    comment.editedAt = new Date().toISOString();
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
      articles: items.filter(e => e.type === "publish_article").length,
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
