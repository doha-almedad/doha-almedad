// js/router.js

const Router = {
  routes: {},

  register(path, renderFunction) {
    this.routes[path] = renderFunction;
  },

  navigate(path) {
    history.pushState({}, "", path);
    this.render();
  },

  back() {
    history.back();
  },

  render() {
    const path = window.location.pathname;

    const route =
      this.routes[path] ||
      this.routes["/"];

    if (route) {
      route();
    }
  },

  start() {
    window.addEventListener("popstate", () => {
      this.render();
    });

    this.render();
  }
};

window.Router = Router;
