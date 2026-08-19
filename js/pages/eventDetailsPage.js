
const EventDetailsPage = {
    render() {
        const data = Store.get();
        const currentId = sessionStorage.getItem('current_event') || 'ev_101';
        const event = data.events.find(e => e.id === currentId) || data.events[0];

        return `
            <section>
                <h2>📌 ${event.title}</h2>
                <div class="card" style="margin-top: 15px;">
                    <p style="font-size: 1.1rem; margin-bottom: 15px;">${event.description}</p>
                    <p><strong>حالة الفعالية:</strong> ${event.status === 'active' ? '🟢 جارية الان' : '🟡 قادمة'}</p>
                    <p><strong>نوع الإثبات المطلوب:</strong> ${event.proofType}</p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border-color);">
                    <button onclick="RewardEngine.processEvent('JOIN_EVENT', {id: '${event.id}'}); alert('تم تقديم إثبات المشاركة!');" style="background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 6px;">تقديم إثبات المشاركة</button>
                </div>
            </section>
        `;
    }
};
