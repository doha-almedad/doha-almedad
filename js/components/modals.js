
const Modals = {
    show(title, content) {
        const modalRoot = document.getElementById('modal-root');
        modalRoot.innerHTML = `
            <div class="modal-overlay" onclick="Modals.close(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="close-btn" onclick="Modals.close()">✕</button>
                    <h3>${title}</h3>
                    <div style="margin-top: 15px;">${content}</div>
                </div>
            </div>
        `;
    },

    close(event) {
        if (!event || event.target.classList.contains('modal-overlay') || event.target.classList.contains('close-btn')) {
            document.getElementById('modal-root').innerHTML = '';
        }
    }
};
