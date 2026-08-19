
const StreakService = {
    recordActivity() {
        const data = Store.get();
        const today = new Date().toISOString().split('T')[0];
        const lastActive = localStorage.getItem('douha_last_active');

        if (lastActive !== today) {
            data.user.streak += 1;
            localStorage.setItem('douha_last_active', today);
            Store.save(data);
        }
    },

    getStreak() {
        const data = Store.get();
        return data.user.streak || 0;
    }
};
