
const Header = {
    render() {
        const data = Store.get();
        return `
            <header class="site-header">
                <div class="logo">
                    <h2>📚 دوحة المِداد</h2>
                </div>
                <nav>
                    <a href="#home">الرئيسية</a>
                    <a href="#events">الفعاليات</a>
                    <a href="#writing">الكتابة</a>
                    <a href="#reading">القراءة</a>
                    <a href="#leaderboard">المتصدرون</a>
                    <a href="#articles">المقالات</a>
                    <a href="#profile">الملف الشخصي</a>
                    <a href="#admin">لوحة التحكم</a>
                </nav>
                <div class="user-quick">
                    <span>🔥 ${data.user.streak}</span>
                    <span>${data.user.avatar} ${data.user.name}</span>
                </div>
            </header>
        `;
    }
};
