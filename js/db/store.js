/* =========================================================
   دوحة المداد — store.js
   محرك التخزين المحلي (LocalStorage) — قراءة/كتابة فورية
   وبثّ التغييرات لبقية أجزاء التطبيق (Pub/Sub بسيط)
   ========================================================= */

import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_ARTICLES, CURRENT_USER_ID } from "./initialData.js";

const DB_KEY = "dawha_almidad_db_v1";
const listeners = new Set();

function seedDB(){
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
  submitArticle({ authorId, title, category, content, image }){
    const submission = {
      id: "as_" + Date.now(),
      authorId, title, category, content, image,
      status: "pending", // pending | approved | rejected
      submittedAt: new Date().toISOString()
    };
    db.articleSubmissions.push(submission);
    persist();
    return submission;
  },
  getArticleSubmissions(){ return db.articleSubmissions; },
  approveArticleSubmission(id){
    const sub = db.articleSubmissions.find(s => s.id === id);
    if(!sub) return null;
    sub.status = "approved";
    db.articles.unshift({
      id: "ar_" + Date.now(), title: sub.title, category: sub.category,
      excerpt: sub.content.slice(0, 130), content: sub.content,
      author: sub.authorId, image: sub.image, date: new Date().toISOString()
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

  /** إضافة تعليق (أو ردّ عبر تمرير parentId) على منشور أو مراجعة */
  addComment(kind, itemId, { userId, text, parentId = null }){
    const list = kind === "post" ? db.posts : db.reviews;
    const item = list.find(i => i.id === itemId);
    if(!item) return null;
    item.comments = item.comments || [];
    const comment = { id: "c_" + Date.now() + Math.random().toString(16).slice(2), userId, text, parentId, date: new Date().toISOString() };
    item.comments.push(comment);
    persist();
    return comment;
  },

  deletePost(id){ db.posts = db.posts.filter(p => p.id !== id); persist(); },
  deleteReview(id){ db.reviews = db.reviews.filter(r => r.id !== id); persist(); },
  deleteEvent(id){ db.events = db.events.filter(e => e.id !== id); persist(); },

  // ---------- سجلّ الأحداث (user_events) ----------
  logUserEvent(userId, type, meta = {}){
    const event = { id: "ue_" + Date.now() + Math.random().toString(16).slice(2), userId, type, meta, timestamp: new Date().toISOString() };
    db.userEvents.push(event);
    persist();
    return event;
  },
  getUserEvents(userId){ return db.userEvents.filter(e => e.userId === userId); },

  // ---------- طلبات اعتماد الفعاليات (admin_verification) ----------
  submitEventProof(eventId, userId, payload){
    const submission = {
      id: "sub_" + Date.now(),
      eventId, userId, payload,
      status: "pending", // pending | approved | rejected
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
