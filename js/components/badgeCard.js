
const BadgeCard = {
    render(badge) {
        const statusClass = badge.unlocked ? 'unlocked' : 'locked';
        const statusText = badge.unlocked ? '🔓 مكتمل' : '🔒 معلق';

        return `
            <div class="badge-card ${statusClass}">
                <div style="font-size: 2.5rem;">${badge.icon}</div>
                <h4 style="margin: 10px 0;">${badge.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${badge.literaryDescription}</p>
                <span style="display: inline-block; margin-top: 10px; font-weight: bold; font-size: 0.8rem;">${statusText}</span>
            </div>
        `;
    }
};
