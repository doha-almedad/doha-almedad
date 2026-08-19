
const Store = {
    init() {
        if (!localStorage.getItem('douha_data')) {
            localStorage.setItem('douha_data', JSON.stringify(InitialData));
        }
    },

    get() {
        this.init();
        return JSON.parse(localStorage.getItem('douha_data'));
    },

    save(data) {
        localStorage.setItem('douha_data', JSON.stringify(data));
    },

    updateUserStats(key, amount) {
        const data = this.get();
        if (data.user.stats[key] !== undefined) {
            data.user.stats[key] += amount;
            this.save(data);
        }
    }
};
