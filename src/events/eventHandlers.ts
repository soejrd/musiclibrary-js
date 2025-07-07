import { fetchAlbums, filterAlbums, getTotalAlbums, shuffleLibrary } from "../data/albumData";
import { calculateGridLayout, initGrid, updateItemSize, zoomIn, zoomOut } from "../grid/gridLayout";
import { clearRenderedAlbums, renderVisibleAlbums, updateRenderedAlbums } from "../grid/rendering";

/**
 * Debounces a function to prevent it from being called too frequently.
 * @param func - The function to debounce.
 * @param wait - Wait time in milliseconds.
 * @returns A debounced version of the input function.
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Sets up event listeners for the application.
 */
export function setupEventListeners(): void {
  // Zoom in button
  document.getElementById("zoomInBtn")?.addEventListener("click", () => {
    if (zoomIn()) {
      updateItemSize();
      calculateGridLayout(getTotalAlbums());
      updateRenderedAlbums();
      renderVisibleAlbums();
    }
  });

  // Zoom out button
  document.getElementById("zoomOutBtn")?.addEventListener("click", () => {
    if (zoomOut()) {
      updateItemSize();
      calculateGridLayout(getTotalAlbums());
      updateRenderedAlbums();
      renderVisibleAlbums();
    }
  });

  // Shuffle button
  document.getElementById("shuffleBtn")?.addEventListener("click", () => {
    shuffleLibrary();
    clearRenderedAlbums();
    renderVisibleAlbums();
  });

  // Resize event with debounce
  window.addEventListener(
    "resize",
    debounce(() => {
      updateItemSize();
      calculateGridLayout(getTotalAlbums());
      updateRenderedAlbums();
      renderVisibleAlbums();
    }, 200)
  );

  // Scroll event with requestAnimationFrame for virtual scrolling
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        renderVisibleAlbums();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Search input with debounce
  document.getElementById("searchInput")?.addEventListener("input", debounce((e: Event) => {
    const input = e.target as HTMLInputElement;
    filterAlbums(input.value);
    clearRenderedAlbums();
    calculateGridLayout(getTotalAlbums());
    renderVisibleAlbums();

    // Toggle visibility of arrow_back icon based on input content
    const arrowBack = document.querySelector(".arrow-back");
    const searchInput = input;
    if (input.value.length > 0) {
      arrowBack?.classList.remove("invisible", "-translate-x-2");
      arrowBack?.classList.add("visible", "translate-x-0");
      searchInput.classList.remove("-translate-x-9");
    } else {
      arrowBack?.classList.remove("visible", "translate-x-0");
      arrowBack?.classList.add("invisible", "-translate-x-2");
      searchInput.classList.add("-translate-x-9");
    }
  }, 200));

  // Arrow back to clear search input
  document.querySelector(".arrow-back")?.addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
    if (searchInput) {
      searchInput.value = "";
      filterAlbums("");
      clearRenderedAlbums();
      calculateGridLayout(getTotalAlbums());
      renderVisibleAlbums();

      // Hide arrow-back and adjust input position
      const arrowBack = document.querySelector(".arrow-back");
      arrowBack?.classList.remove("visible", "translate-x-0");
      arrowBack?.classList.add("invisible", "-translate-x-2");
      searchInput.classList.add("-translate-x-9");
    }
  });

  // Theme toggle button
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    const htmlElement = document.documentElement;
    const themeIcon = document.querySelector("#themeBtn .material-symbols-rounded");
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
      if (themeIcon) themeIcon.textContent = "dark_mode";
      localStorage.setItem("theme", "light");
    } else {
      htmlElement.classList.add("dark");
      if (themeIcon) themeIcon.textContent = "light_mode";
      localStorage.setItem("theme", "dark");
    }
  });

  // Apply saved theme on load
  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    const htmlElement = document.documentElement;
    const themeIcon = document.querySelector("#themeBtn .material-symbols-rounded");
    if (savedTheme === "light") {
      htmlElement.classList.add("light");
      if (themeIcon) themeIcon.textContent = "light_mode";
    } else {
      htmlElement.classList.remove("light");
      if (themeIcon) themeIcon.textContent = "dark_mode";
    }
  });
}

/**
 * Initializes the application on DOM content loaded.
 */
export function initializeApp(): void {
  document.addEventListener("DOMContentLoaded", async () => {
    initGrid();
    await fetchAlbums();
    shuffleLibrary();
    calculateGridLayout(getTotalAlbums());
    renderVisibleAlbums();
    setupEventListeners();
  });
}
