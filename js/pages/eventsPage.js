
const EventsPage = {
    render() {
        const data = Store.get();
        return `
            <section>
                <h2>🎯 الفعاليات والأنشطة الأدبية</h2>
                <p style="color: var(--text-muted); margin-bottom: 20px;">شارك في التحديات المستمرة واستعرض إثباتات مشاركتك.</p>
                
                <div class="grid">
                    ${data.events.map(ev => `
                        <div class="card">
                            <h4>${ev.title}</h4>
                            <p style="margin: 10px 0;">${ev.description}</p>
                            <span style="display: inline-block; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; font-size: 0.8rem; margin-bottom: 15px;">نوع الإثبات: ${ev.proofType}</span>
                            <br>
                            <button onclick="RewardEngine.processEvent('JOIN_EVENT', {id: '${ev.id}'}); alert('تم تسجيل مشاركتك بنجاح!');" style="background: var(--primary-color); color: white; padding: 8px 16px; border-radius: 6px;">انضمام للفعالية</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }
};
