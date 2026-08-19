
const RewardEngine = {
    // معالجة الأحداث وتوزيع الإنجازات
    processEvent(eventType, payload) {
        const data = Store.get();

        if (eventType === 'WRITE_WORDS') {
            data.user.stats.wordsWritten += payload.count || 0;
        } else if (eventType === 'READ_BOOK') {
            data.user.stats.booksRead += payload.count || 1;
        } else if (eventType === 'JOIN_EVENT') {
            data.user.stats.eventsJoined += payload.count || 1;
        }

        Store.save(data);
        BadgeService.checkBadges();
        StreakService.recordActivity();
    }
};
