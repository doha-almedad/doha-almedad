
const BadgeService = {
    checkBadges() {
        const data = Store.get();
        let updated = false;

        data.badges.forEach(badge => {
            if (!badge.unlocked) {
                // شروط فتح الأوسمة
                if (badge.id === 'b3' && data.user.stats.booksRead >= 3) {
                    badge.unlocked = true;
                    updated = true;
                }
            }
        });

        if (updated) {
            Store.save(data);
        }
    }
};
