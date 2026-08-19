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

  // ---------- الكتابة (منشورات) ----------
  getPosts(){ return [...db.posts].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  addPost(post){
    const item = { id: "p_" + Date.now(), date: new Date().toISOString(), likes: 0, comments: [], ...post };
    db.posts.unshift(item);
    persist();
    return item;
  },

  // ---------- القراءة (مراجعات) ----------
  getReviews(){ return [...db.reviews].sort((a,b) => new Date(b.date) - new Date(a.date)); },
  addReview(review){
    const item = { id: "r_" + Date.now(), date: new Date().toISOString(), likes: 0, ...review };
    db.reviews.unshift(item);
    persist();
    return item;
  },

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
  addNotification(userId, text, icon = "🔔"){
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
