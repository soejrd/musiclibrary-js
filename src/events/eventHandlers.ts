import { fetchAlbums, filterAlbums, getTotalAlbums, shuffleLibrary } from "../data/albumData";
import { calculateGridLayout, initGrid, updateItemSize, zoomIn, zoomOut, setViewMode, getViewMode } from "../grid/gridLayout";
import { clearRenderedAlbums, renderVisibleAlbums, updateRenderedAlbums } from "../grid/rendering";
import { renderCoverflowAlbums, clearCoverflowAlbums, updateCoverflowRenderedAlbums, updateCoverflowStyles } from "../coverflow/rendering";

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
 * Renders albums based on the current view mode.
 */
function renderAlbumsBasedOnViewMode(): void {
  const viewMode = getViewMode();
  if (viewMode === 'grid') {
    renderVisibleAlbums();
  } else if (viewMode === 'coverflow') {
    renderCoverflowAlbums();
  }
}

/**
 * Clears rendered albums based on the current view mode.
 */
function clearAlbumsBasedOnViewMode(): void {
  const viewMode = getViewMode();
  if (viewMode === 'grid') {
    clearRenderedAlbums();
  } else if (viewMode === 'coverflow') {
    clearCoverflowAlbums();
  }
}

/**
 * Sets up event listeners for the application.
 */
export function setupEventListeners(): void {
  // Toggle view mode between grid and coverflow
  document.getElementById("viewToggleBtn")?.addEventListener("click", () => {
    const currentMode = getViewMode();
    const newMode = currentMode === 'grid' ? 'coverflow' : 'grid';
    setViewMode(newMode);
    // Update button text or icon based on mode
    const viewIcon = document.querySelector("#viewToggleBtn .material-symbols-rounded");
    if (viewIcon) {
      viewIcon.textContent = newMode === 'grid' ? 'view_carousel' : 'grid_view';
    }
    // Clear current view and render new view
    clearAlbumsBasedOnViewMode();
    if (newMode === 'grid') {
      calculateGridLayout(getTotalAlbums());
    }
    renderAlbumsBasedOnViewMode();
    if (newMode === 'coverflow') {
      updateCoverflowStyles();
    }
  });
  
  // Handle hover effects for global scrim
  const grid = document.getElementById("grid");
  const scrim = document.querySelector(".scrim");
  if (grid && scrim) {
    grid.addEventListener("mouseover", (e) => {
      const target = e.target as HTMLElement;
      if (getViewMode() === 'grid' && (target.classList.contains("album-card") || target.closest(".album-card"))) {
        scrim.classList.remove("opacity-0");
        scrim.classList.add("opacity-70");
        const albumCard = target.classList.contains("album-card") ? target : target.closest(".album-card");
        if (albumCard) {
          albumCard.classList.add("z-50");
        }
      }
    });
    
    grid.addEventListener("mouseout", (e) => {
      const target = e.target as HTMLElement;
      if (getViewMode() === 'grid' && (target.classList.contains("album-card") || target.closest(".album-card"))) {
        scrim.classList.remove("opacity-70");
        scrim.classList.add("opacity-0");
        const albumCard = target.classList.contains("album-card") ? target : target.closest(".album-card");
        if (albumCard) {
          albumCard.classList.remove("z-50");
        }
      }
    });
  }

  // Zoom in button (only active in grid mode)
  document.getElementById("zoomInBtn")?.addEventListener("click", () => {
    if (getViewMode() === 'grid' && zoomIn()) {
      updateItemSize();
      calculateGridLayout(getTotalAlbums());
      updateRenderedAlbums();
      renderVisibleAlbums();
    }
  });

  // Zoom out button (only active in grid mode)
  document.getElementById("zoomOutBtn")?.addEventListener("click", () => {
    if (getViewMode() === 'grid' && zoomOut()) {
      updateItemSize();
      calculateGridLayout(getTotalAlbums());
      updateRenderedAlbums();
      renderVisibleAlbums();
    }
  });

  // Shuffle button
  document.getElementById("shuffleBtn")?.addEventListener("click", () => {
    shuffleLibrary();
    clearAlbumsBasedOnViewMode();
    renderAlbumsBasedOnViewMode();
  });

  // Resize event with debounce
  window.addEventListener(
    "resize",
    debounce(() => {
      if (getViewMode() === 'grid') {
        updateItemSize();
        calculateGridLayout(getTotalAlbums());
        updateRenderedAlbums();
        renderVisibleAlbums();
      }
    }, 200)
  );

  // Scroll event with requestAnimationFrame for virtual scrolling (only in grid mode)
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (getViewMode() === 'grid' && !ticking) {
      requestAnimationFrame(() => {
        renderVisibleAlbums();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Scroll event for coverflow mode to update styles and rendered albums based on visible center album
  let coverflowTicking = false;
  document.getElementById("grid")?.addEventListener("scroll", () => {
    if (getViewMode() === 'coverflow' && !coverflowTicking) {
      requestAnimationFrame(() => {
        updateCoverflowStyles();
        coverflowTicking = false;
      });
      coverflowTicking = true;
    }
  });

  // Search input with debounce
  document.getElementById("searchInput")?.addEventListener("input", debounce((e: Event) => {
    const input = e.target as HTMLInputElement;
    filterAlbums(input.value);
    clearAlbumsBasedOnViewMode();
    if (getViewMode() === 'grid') {
      calculateGridLayout(getTotalAlbums());
    }
    renderAlbumsBasedOnViewMode();

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
      clearAlbumsBasedOnViewMode();
      if (getViewMode() === 'grid') {
        calculateGridLayout(getTotalAlbums());
      }
      renderAlbumsBasedOnViewMode();

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
    renderAlbumsBasedOnViewMode();
    setupEventListeners();
  });
}
