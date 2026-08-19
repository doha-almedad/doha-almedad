
const ProfilePage = {
    render() {
        const data = Store.get();
        return `
            <section>
                <div class="profile-header">
                    <div class="profile-avatar">${data.user.avatar}</div>
                    <div>
                        <h2>${data.user.name}</h2>
                        <p style="color: var(--text-muted);">@${data.user.username} • المستوى ${data.user.level}</p>
                    </div>
                </div>

                <div class="streak-banner">
                    🔥 سلسلة حماسة الأدب: ${data.user.streak} أيام متتالية من النشاط!
                </div>

                <h3>📊 الإحصائيات (قاعدة إخفاء الصفر)</h3>
                <div class="grid" style="margin: 15px 0 30px 0;">
                    ${data.user.stats.wordsWritten > 0 ? `<div class="card"><h4>الكلمات المكتوبة</h4><p style="font-size: 1.5rem; font-weight: bold;">${data.user.stats.wordsWritten}</p></div>` : ''}
                    ${data.user.stats.booksRead > 0 ? `<div class="card"><h4>الكتب المقروءة</h4><p style="font-size: 1.5rem; font-weight: bold;">${data.user.stats.booksRead}</p></div>` : ''}
                    ${data.user.stats.eventsJoined > 0 ? `<div class="card"><h4>المشاركات بالفعاليات</h4><p style="font-size: 1.5rem; font-weight: bold;">${data.user.stats.eventsJoined}</p></div>` : ''}
                </div>

                <h3>🏅 الأوسمة والإنجازات</h3>
                <div class="grid" style="margin-top: 15px;">
                    ${data.badges.map(b => BadgeCard.render(b)).join('')}
                </div>
            </section>
        `;
    }
};
