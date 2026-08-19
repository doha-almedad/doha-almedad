/* =========================================================
   دوحة المداد — writingPage.js
   3. قسم الكتابة: المساحة المخصصة لنشر القطع الأدبية والفصول
   ========================================================= */

import { store } from "../db/store.js";
import { processActivity } from "../services/rewardEngine.js";
import { showToast } from "../components/modals.js";

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 60) return `منذ ${Math.max(1,diffMin)} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h/24)} يوم`;
}

function wordCount(text){ return text.trim().split(/\s+/).filter(Boolean).length; }

function renderFeed(){
  const posts = store.getPosts();
  if(!posts.length){
    return `<div class="empty-state"><div class="empty-state__icon">🪶</div><p>لم يُنشر أي نص بعد. كن أول من يخطّ حرفاً هنا.</p></div>`;
  }
  return posts.map(p => {
    const author = store.getUser(p.authorId);
    return `
      <article class="card feed-item">
        <div class="feed-item__head">
          <div class="avatar avatar--sm">${author?.avatarEmoji || "🖋️"}</div>
          <div>
            <div class="feed-item__name">${author?.displayName || "عضو"}</div>
            <div class="feed-item__time">${timeAgo(p.date)}</div>
          </div>
          ${p.type === "chapter" ? `<span class="badge-pill badge-pill--gold" style="margin-inline-start:auto;">فصل أدبي</span>` : ""}
        </div>
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <div class="feed-item__actions">
          <span data-like="${p.id}">🤍 إعجاب (${p.likes})</span>
          <span>💬 تعليق</span>
          <span>📝 ${wordCount(p.content)} كلمة</span>
        </div>
      </article>
    `;
  }).join("");
}

export function renderWritingPage(root){
  const user = store.getCurrentUser();

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">مساحتك الأدبية</span><h1>الكتابة</h1></div>
        </div>

        <div class="card composer" style="margin-bottom:34px;">
          <h3 style="margin-bottom:14px;">✒️ انشر قطعة جديدة</h3>
          <div class="composer__meta">
            <div class="field">
              <label>عنوان النص</label>
              <input type="text" id="post-title" placeholder="عنوان قطعتك الأدبية">
            </div>
            <div class="field" style="max-width:180px;">
              <label>نوع النص</label>
              <select id="post-type">
                <option value="piece">قطعة أدبية</option>
                <option value="chapter">فصل من عمل</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>النص</label>
            <textarea id="post-content" placeholder="اكتب هنا... كل كلمة تُحتسب ضمن مسيرتك الأدبية."></textarea>
          </div>
          <button class="btn btn-primary" id="publish-post-btn">نشر</button>
        </div>

        <div class="section-head"><h2>آخر المنشورات</h2></div>
        <div id="writing-feed">${renderFeed()}</div>
      </div>
    </section>
  `;

  root.querySelector("#publish-post-btn").addEventListener("click", () => {
    const title = root.querySelector("#post-title").value.trim();
    const content = root.querySelector("#post-content").value.trim();
    const type = root.querySelector("#post-type").value;
    if(!title || !content){
      showToast("يرجى إدخال عنوان ونص قبل النشر");
      return;
    }
    store.addPost({ authorId: user.id, title, content, type });
    processActivity(user.id, "publish_post", {
      wordCount: wordCount(content),
      isFullWork: type === "chapter"
    });
    showToast("نُشر نصّك — أضيئت شعلة حماستك اليوم 🔥");
    renderWritingPage(root);
  });

  root.querySelectorAll("[data-like]").forEach(el => {
    el.addEventListener("click", () => {
      // الإعجاب المجرد لا يُحتسب كنشاط مؤهل — تفاعل اجتماعي فقط
      const id = el.getAttribute("data-like");
      const post = store.getPosts().find(p => p.id === id);
      if(post){ post.likes++; store.commit(); renderWritingPage(root); }
    });
  });
}
