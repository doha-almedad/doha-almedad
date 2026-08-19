const Router = {
    routes: {
        '#home': HomePage,
        '#events': EventsPage,
        '#writing': WritingPage,
        '#reading': ReadingPage,
        '#leaderboard': LeaderboardPage,
        '#articles': ArticlesPage,
        '#profile': ProfilePage,
        '#event-details': EventDetailsPage,
        '#admin': AdminDashboardPage
    },

    init() {
        window.addEventListener('hashchange', () => this.render());
        if (!window.location.hash || !this.routes[window.location.hash]) {
            window.location.hash = '#home';
        } else {
            this.render();
        }
    },

    render() {
        const hash = window.location.hash;
        const page = this.routes[hash] || HomePage;
        
        // إعادة رسم الهيدر وتحديث المحتوى
        document.getElementById('header-root').innerHTML = Header.render();
        document.getElementById('app-root').innerHTML = page.render();
        document.getElementById('footer-root').innerHTML = Footer.render();
        
        // التمرير لأعلى الصفحة عند التنقل
        window.scrollTo(0, 0);
    }
};
