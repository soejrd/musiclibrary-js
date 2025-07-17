import {
  fetchAlbums,
  filterAlbums,
  getTotalAlbums,
  shuffleLibrary,
} from "../data/albumData";
import {
  calculateGridLayout,
  initGrid,
  updateItemSize,
  zoomIn,
  zoomOut,
  setViewMode,
  getViewMode,
  getGridElement
} from "../grid/gridLayout";

import {
  clearGridAlbums,
  renderGridAlbums,
  updateRenderedAlbums,
} from "../grid/rendering";
import {
  renderCoverflowAlbums,
  clearCoverflowAlbums,
  updateCoverflowRenderedAlbums,
  updateCoverflowStyles,
} from "../coverflow/rendering";

/**
 * Renders the control buttons dynamically into the controls container.
 */
function renderControlButtons(): void {
  const controlsContainer = document.getElementById("controlsContainer");
  if (!controlsContainer) return;

  const buttonConfigs = [
    {
      id: "shuffleBtn",
      icon: "shuffle",
      className: "controls--shuffle",
      handler: () => {
        shuffleLibrary();
        clearAlbumsBasedOnViewMode();
        renderAlbumsBasedOnViewMode();
      },
    },
    {
      id: "zoomOutBtn",
      icon: "zoom_out",
      handler: () => {
        if (getViewMode() === "grid" && zoomOut()) {
          updateItemSize();
          calculateGridLayout(getTotalAlbums());
          updateRenderedAlbums();
          renderGridAlbums();
        }
      },
    },
    {
      id: "zoomInBtn",
      icon: "zoom_in",
      handler: () => {
        if (getViewMode() === "grid" && zoomIn()) {
          updateItemSize();
          calculateGridLayout(getTotalAlbums());
          updateRenderedAlbums();
          renderGridAlbums();
        }
      },
    },
    {
      id: "viewToggleBtn",
      icon: "view_carousel",
      handler: () => {
        const currentMode = getViewMode();
        const newMode = currentMode === "grid" ? "coverflow" : "grid";
        setViewMode(newMode);
        const viewIcon = document.querySelector(
          "#viewToggleBtn .material-symbols-rounded"
        );
        if (viewIcon) {
          viewIcon.textContent =
            newMode === "grid" ? "view_carousel" : "grid_view";
        }

        // Handle zoom buttons visibility and position based on view mode
        const zoomInBtn = document.getElementById("zoomInBtn");
        const zoomOutBtn = document.getElementById("zoomOutBtn");
        if (zoomInBtn && zoomOutBtn) {
          if (newMode === "coverflow") {
            zoomInBtn.classList.add(
              "w-0",
              "opacity-0",
              "-translate-x-full",
              "collapse"
            );
            zoomOutBtn.classList.add(
              "w-0",
              "opacity-0",
              "translate-x-full",
              "collapse"
            );
            zoomInBtn.classList.remove("px-2");
            zoomOutBtn.classList.remove("px-2");
          } else {
            zoomInBtn.classList.remove(
              "w-0",
              "opacity-0",
              "-translate-x-full",
              "collapse"
            );
            zoomOutBtn.classList.remove(
              "w-0",
              "opacity-0",
              "translate-x-full",
              "collapse"
            );
            zoomInBtn.classList.add("px-2");
            zoomOutBtn.classList.add("px-2");
          }
        }

        clearAlbumsBasedOnViewMode();
        if (newMode === "grid") {
          calculateGridLayout(getTotalAlbums());
        }
        renderAlbumsBasedOnViewMode();
        if (newMode === "coverflow") {
          updateCoverflowStyles();
        }
      },
    },
    {
      id: "themeBtn",
      icon: "light_mode",
      handler: () => {
        const htmlElement = document.documentElement;
        const themeIcon = document.querySelector(
          "#themeBtn .material-symbols-rounded"
        );
        if (htmlElement.classList.contains("dark")) {
          htmlElement.classList.remove("dark");
          if (themeIcon) themeIcon.textContent = "dark_mode";
          localStorage.setItem("theme", "light");
        } else {
          htmlElement.classList.add("dark");
          if (themeIcon) themeIcon.textContent = "light_mode";
          localStorage.setItem("theme", "dark");
        }
      },
    },
  ];

  buttonConfigs.forEach((config) => {
    const button = document.createElement("button");
    button.id = config.id;
    button.className =
      "px-2 py-2 text-zinc-500 dark:text-zinc-400 dark:hover:text-white hover:text-black flex cursor-pointer hover:bg-white/30 dark:hover:bg-zinc-950/30 rounded-sm duration-150 ease-out" +
      (config.className ? ` ${config.className}` : "");
    const iconSpan = document.createElement("span");
    iconSpan.className = "material-symbols-rounded";
    iconSpan.textContent = config.icon;
    button.appendChild(iconSpan);
    if (config.handler) {
      button.addEventListener("click", config.handler);
    }
    controlsContainer.appendChild(button);
  });

  // Apply saved theme on load
  const savedTheme = localStorage.getItem("theme");
  const htmlElement = document.documentElement;
  const themeIcon = document.querySelector(
    "#themeBtn .material-symbols-rounded"
  );
  if (savedTheme === "light") {
    htmlElement.classList.remove("dark");
    if (themeIcon) themeIcon.textContent = "dark_mode";
  } else {
    htmlElement.classList.add("dark");
    if (themeIcon) themeIcon.textContent = "light_mode";
  }
}

/**
 * Debounces a function to prevent it from being called too frequently.
 * @param func - The function to debounce.
 * @param wait - Wait time in milliseconds.
 * @returns A debounced version of the input function.
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
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
  if (viewMode === "grid") {
    renderGridAlbums();
  } else if (viewMode === "coverflow") {
    renderCoverflowAlbums();
  }
}

/**
 * Clears rendered albums based on the current view mode.
 */
function clearAlbumsBasedOnViewMode(): void {
  const viewMode = getViewMode();
  if (viewMode === "grid") {
    clearGridAlbums();
  } else if (viewMode === "coverflow") {
    clearCoverflowAlbums();
  }
}

/**
 * Sets up event listeners for the application.
 */
export function setupEventListeners(): void {
  // Handle hover effects for global scrim
  const grid = document.getElementById("grid");
  const scrim = document.querySelector(".scrim");
  if (grid && scrim) {
    grid.addEventListener("mouseover", (e) => {
      const target = e.target as HTMLElement;
      if (
        getViewMode() === "grid" &&
        (target.classList.contains("album-card") ||
          target.closest(".album-card"))
      ) {
        scrim.classList.remove("opacity-0");
        scrim.classList.add("opacity-70");
        const albumCard = target.classList.contains("album-card")
          ? target
          : target.closest(".album-card");
        if (albumCard) {
          albumCard.classList.add("z-50");
        }
      }
    });

    grid.addEventListener("mouseout", (e) => {
      const target = e.target as HTMLElement;
      if (
        getViewMode() === "grid" &&
        (target.classList.contains("album-card") ||
          target.closest(".album-card"))
      ) {
        scrim.classList.remove("opacity-70");
        scrim.classList.add("opacity-0");
        const albumCard = target.classList.contains("album-card")
          ? target
          : target.closest(".album-card");
        if (albumCard) {
          albumCard.classList.remove("z-50");
        }
      }
    });
  }

  // Resize event with debounce
  window.addEventListener(
    "resize",
    debounce(() => {
      if (getViewMode() === "grid") {
        updateItemSize();
        calculateGridLayout(getTotalAlbums());
        updateRenderedAlbums();
        renderGridAlbums();
      }
    }, 200)
  );

  // Scroll event with requestAnimationFrame for virtual scrolling (only in grid mode)
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (getViewMode() === "grid" && !ticking) {
      requestAnimationFrame(() => {
        renderGridAlbums();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Scroll event for coverflow mode to update styles and rendered albums based on visible center album
  let coverflowTicking = false;
  document.getElementById("grid")?.addEventListener("scroll", () => {
    if (getViewMode() === "coverflow" && !coverflowTicking) {
      requestAnimationFrame(() => {
        updateCoverflowStyles();
        coverflowTicking = false;
      });
      coverflowTicking = true;
    }
  });

  const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;

  // Function to handle search input changes
  const handleSearchInput = debounce((value: string) => {
    filterAlbums(value);
    clearAlbumsBasedOnViewMode();
    if (getViewMode() === "grid") {
      calculateGridLayout(getTotalAlbums());
    }
    renderAlbumsBasedOnViewMode();

    // Toggle visibility of arrow_back icon based on input content
    const arrowBack = document.querySelector(".arrow-back");
    if (searchInput) {
      if (value.length > 0) {
        arrowBack?.classList.remove("invisible", "-translate-x-2");
        arrowBack?.classList.add("visible", "translate-x-0");
        searchInput.classList.remove("-translate-x-9");
      } else {
        arrowBack?.classList.remove("visible", "translate-x-0");
        arrowBack?.classList.add("invisible", "-translate-x-2");
        searchInput.classList.add("-translate-x-9");
      }
    }
  }, 200);

  // Search input with debounce
  searchInput?.addEventListener("input", (e: Event) => {
    const input = e.target as HTMLInputElement;
    handleSearchInput(input.value);
  });

  // Global keydown listener for search
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!searchInput) return;

    // Check if a modifier key (Ctrl, Alt, Meta) is pressed or if it's a function key, etc.
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1 && e.key !== "Backspace") {
      return;
    }

    // If an input, textarea, or select element is focused, don't interfere
    if (document.activeElement && (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.tagName === 'SELECT'
    )) {
      return;
    }

    if (e.key === "Backspace") {
      if (searchInput.value.length > 0) {
        searchInput.value = searchInput.value.slice(0, -1);
        handleSearchInput(searchInput.value);
        e.preventDefault(); // Prevent browser back navigation
      }
    } else if (e.key.length === 1) { // Check if it's a single character (printable)
      if (document.activeElement !== searchInput) {
        searchInput.focus();
        searchInput.value = e.key; // Set the first character
      }
      // For subsequent characters or if already focused, the browser will add the key
      // The 'input' event listener will then handle the filtering
      e.preventDefault(); // Prevent default behavior (e.g., scrolling if spacebar is pressed)
    }
  });

  // Arrow back to clear search input
  document.querySelector(".arrow-back")?.addEventListener("click", () => {
    const searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement | null;
    if (searchInput) {
      searchInput.value = "";
      filterAlbums("");
      clearAlbumsBasedOnViewMode();
      if (getViewMode() === "grid") {
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

  // Theme handling is now managed in renderControlButtons
}

export function clearAlbums(renderedIndices: Set<number>): void {
  const grid = getGridElement();
  if (!grid) return;

  grid.innerHTML = '';
  renderedIndices.clear();
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
    renderControlButtons();
    setupEventListeners();
  });
}
