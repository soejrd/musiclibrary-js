import { Header } from "./components/Header";
import { initializeApp } from "./events/eventHandlers";

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  if (app) {
    app.prepend(Header());
  }
  await initializeApp();
});
