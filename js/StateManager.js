const StateManager = {

  currentState: null,

  init() {},

  setState(newState) {

    this.currentState = newState;
    console.log("State changed to:", newState);

    const boot = document.getElementById("boot-screen");
    const app = document.getElementById("app");
    const menu = document.getElementById("menu-screen");
    const ambient = document.getElementById("ambient-layer");

    boot.classList.add("active");
    boot.classList.remove("hidden");
    boot.classList.toggle("background", newState === "MENU");

    app.classList.toggle("active", newState === "MENU");
    app.classList.toggle("hidden", newState !== "MENU");

    menu.classList.toggle("active", newState === "MENU");
    menu.classList.toggle("hidden", newState !== "MENU");

    ambient.classList.toggle("ambient-visible", newState === "MENU");

  }

};
