
const LeaderboardPage = {
    render() {
        const data = Store.get();
        return `
            <section>
                <h2>🏆 لوحة المتصدرين</h2>
                <div class="card" style="margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color);">
                                <th style="padding: 10px;">العضو</th>
                                <th style="padding: 10px;">المستوى</th>
                                <th style="padding: 10px;">السلسلة 🔥</th>
                                <th style="padding: 10px;">الكلمات المكتوبة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px;">${data.user.avatar} ${data.user.name} (أنت)</td>
                                <td style="padding: 12px;">المستوى ${data.user.level}</td>
                                <td style="padding: 12px;">${data.user.streak} أيام</td>
                                <td style="padding: 12px;">${data.user.stats.wordsWritten}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }
};
