import {
  fetchAlbums,
  filterAlbums,
  getTotalAlbums,
  shuffleLibrary,
} from "../data/albumData";
import {
  calculateGridLayout,
  getGridElement,
  getViewMode,
  initGrid,
  setViewMode,
  updateItemSize,
  zoomIn,
  zoomOut,
} from "../grid/gridLayout";
import {
  clearCoverflowAlbums,
  renderCoverflowAlbums,
  updateCoverflowStyles,
} from "../coverflow/rendering";
import {
  clearGridAlbums,
  renderGridAlbums,
  updateRenderedAlbums,
} from "../grid/rendering";

// --- Constants ---
const THEME = {
  LIGHT: "light",
  DARK: "dark",
};

const VIEW_MODE = {
  GRID: "grid",
  COVERFLOW: "coverflow",
};

// --- Helper Functions ---

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
  if (viewMode === VIEW_MODE.GRID) {
    renderGridAlbums();
  } else if (viewMode === VIEW_MODE.COVERFLOW) {
    renderCoverflowAlbums();
  }
}

/**
 * Clears rendered albums based on the current view mode.
 */
function clearAlbumsBasedOnViewMode(): void {
  const viewMode = getViewMode();
  if (viewMode === VIEW_MODE.GRID) {
    clearGridAlbums();
  } else if (viewMode === VIEW_MODE.COVERFLOW) {
    clearCoverflowAlbums();
  }
}

/**
 * Clears and re-renders all albums, recalculating layout if in grid view.
 */
function refreshAlbumDisplay(): void {
  clearAlbumsBasedOnViewMode();
  if (getViewMode() === VIEW_MODE.GRID) {
    calculateGridLayout(getTotalAlbums());
  }
  renderAlbumsBasedOnViewMode();
}

/**
 * Redraws the grid layout, e.g., after a resize or zoom change.
 */
function redrawGrid(): void {
  if (getViewMode() !== VIEW_MODE.GRID) return;
  updateItemSize();
  calculateGridLayout(getTotalAlbums());
  updateRenderedAlbums();
  renderGridAlbums();
}

/**
 * Toggles the theme between light and dark mode.
 */
function handleTheme(): void {
  const htmlElement = document.documentElement;
  const themeIcon = document.querySelector(
    "#themeBtn .material-symbols-rounded"
  );
  const isDark = htmlElement.classList.toggle(THEME.DARK);
  const newTheme = isDark ? THEME.DARK : THEME.LIGHT;

  if (themeIcon) {
    themeIcon.textContent = isDark ? "light_mode" : "dark_mode";
  }
  localStorage.setItem("theme", newTheme);
}

/**
 * Applies the saved theme on initial load.
 */
function applySavedTheme(): void {
  const savedTheme = localStorage.getItem("theme");
  const htmlElement = document.documentElement;
  const themeIcon = document.querySelector(
    "#themeBtn .material-symbols-rounded"
  );

  if (savedTheme === THEME.LIGHT) {
    htmlElement.classList.remove(THEME.DARK);
    if (themeIcon) themeIcon.textContent = "dark_mode";
  } else {
    htmlElement.classList.add(THEME.DARK);
    if (themeIcon) themeIcon.textContent = "light_mode";
  }
}

// --- Control Button Rendering ---

/**
 * Creates a control button element.
 * @param config - The configuration for the button.
 * @returns The created button element.
 */
function createButton(config: {
  id: string;
  icon: string;
  className?: string;
  handler: () => void;
}): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = config.id;
  button.className =
    "px-2 py-2 text-zinc-500 dark:text-zinc-400 dark:hover:text-white hover:text-black flex cursor-pointer hover:bg-white/30 dark:hover:bg-zinc-950/30 rounded-sm duration-150 ease-out" +
    (config.className ? ` ${config.className}` : "");

  const iconSpan = document.createElement("span");
  iconSpan.className = "material-symbols-rounded";
  iconSpan.textContent = config.icon;

  button.appendChild(iconSpan);
  button.addEventListener("click", config.handler);

  return button;
}

/**
 * Toggles the visibility of zoom buttons based on the view mode.
 * @param newMode - The new view mode ('grid' or 'coverflow').
 */
function toggleZoomButtonsVisibility(newMode: "grid" | "coverflow"): void {
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  if (!zoomInBtn || !zoomOutBtn) return;

  const isCoverflow = newMode === VIEW_MODE.COVERFLOW;
  const classesToAdd = isCoverflow
    ? ["w-0", "opacity-0", "collapse"]
    : ["px-2"];
  const classesToRemove = isCoverflow
    ? ["px-2"]
    : ["w-0", "opacity-0", "collapse"];

  zoomInBtn.classList.add(...classesToAdd);
  zoomInBtn.classList.remove(...classesToRemove);
  zoomOutBtn.classList.add(...classesToAdd);
  zoomOutBtn.classList.remove(...classesToRemove);

  if (isCoverflow) {
    zoomInBtn.classList.add("-translate-x-full");
    zoomOutBtn.classList.add("translate-x-full");
  } else {
    zoomInBtn.classList.remove("-translate-x-full");
    zoomOutBtn.classList.remove("translate-x-full");
  }
}

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
        refreshAlbumDisplay();
      },
    },
    {
      id: "zoomOutBtn",
      icon: "zoom_out",
      handler: () => {
        if (getViewMode() === VIEW_MODE.GRID && zoomOut()) {
          redrawGrid();
        }
      },
    },
    {
      id: "zoomInBtn",
      icon: "zoom_in",
      handler: () => {
        if (getViewMode() === VIEW_MODE.GRID && zoomIn()) {
          redrawGrid();
        }
      },
    },
    {
      id: "viewToggleBtn",
      icon: "view_carousel",
      handler: () => {
        const currentMode = getViewMode();
        const newMode =
          currentMode === VIEW_MODE.GRID
            ? VIEW_MODE.COVERFLOW
            : VIEW_MODE.GRID;
        setViewMode(newMode as "grid" | "coverflow");

        const viewIcon = document.querySelector(
          "#viewToggleBtn .material-symbols-rounded"
        );
        if (viewIcon) {
          viewIcon.textContent =
            newMode === VIEW_MODE.GRID ? "view_carousel" : "grid_view";
        }

        toggleZoomButtonsVisibility(newMode as "grid" | "coverflow");
        refreshAlbumDisplay();

        if (newMode === VIEW_MODE.COVERFLOW) {
          updateCoverflowStyles();
        }
      },
    },
    {
      id: "themeBtn",
      icon: "light_mode",
      handler: handleTheme,
    },
  ];

  const fragment = document.createDocumentFragment();
  buttonConfigs.forEach((config) => fragment.appendChild(createButton(config)));
  controlsContainer.appendChild(fragment);

  applySavedTheme();
}

// --- Event Listener Setup ---

/**
 * Updates the search input UI (arrow and input position).
 * @param hasValue - Whether the search input has a value.
 */
function updateSearchUI(hasValue: boolean): void {
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  const arrowBack = document.querySelector(".arrow-back");
  if (!searchInput || !arrowBack) return;

  if (hasValue) {
    arrowBack.classList.remove("invisible", "-translate-x-2");
    arrowBack.classList.add("visible", "translate-x-0");
    searchInput.classList.remove("-translate-x-9");
  } else {
    arrowBack.classList.remove("visible", "translate-x-0");
    arrowBack.classList.add("invisible", "-translate-x-2");
    searchInput.classList.add("-translate-x-9");
  }
}

function setupGridHoverEffects(): void {
  const grid = document.getElementById("grid");
  const scrim = document.querySelector(".scrim");
  if (!grid || !scrim) return;

  const handleMouseEvent = (e: MouseEvent, isMouseOver: boolean) => {
    const target = e.target as HTMLElement;
    const albumCard = target.closest(".album-card");
    if (getViewMode() === VIEW_MODE.GRID && albumCard) {
      scrim.classList.toggle("opacity-0", !isMouseOver);
      scrim.classList.toggle("opacity-70", isMouseOver);
      albumCard.classList.toggle("z-50", isMouseOver);
    }
  };

  grid.addEventListener("mouseover", (e) => handleMouseEvent(e, true));
  grid.addEventListener("mouseout", (e) => handleMouseEvent(e, false));
}

function setupScrollListeners(): void {
  // Virtual scrolling for grid view
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (getViewMode() === VIEW_MODE.GRID && !ticking) {
      window.requestAnimationFrame(() => {
        renderGridAlbums();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Style updates for coverflow view
  let coverflowTicking = false;
  getGridElement()?.addEventListener("scroll", () => {
    if (getViewMode() === VIEW_MODE.COVERFLOW && !coverflowTicking) {
      window.requestAnimationFrame(() => {
        updateCoverflowStyles();
        coverflowTicking = false;
      });
      coverflowTicking = true;
    }
  });
}

function setupSearchListeners(): void {
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement | null;
  if (!searchInput) return;

  const handleSearch = debounce((value: string) => {
    filterAlbums(value);
    refreshAlbumDisplay();
    updateSearchUI(value.length > 0);
  }, 200);

  searchInput.addEventListener("input", (e: Event) => {
    handleSearch((e.target as HTMLInputElement).value);
  });

  document.querySelector(".arrow-back")?.addEventListener("click", () => {
    searchInput.value = "";
    handleSearch("");
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    const isSearchFocused = activeEl === searchInput;
    const isOtherInputFocused =
      activeEl &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName) &&
      !isSearchFocused;

    if (e.ctrlKey || e.altKey || e.metaKey || isOtherInputFocused) {
      return;
    }

    const isPrintableKey = e.key.length === 1;
    const isBackspace = e.key === "Backspace";

    if (!isSearchFocused && (isPrintableKey || isBackspace)) {
      e.preventDefault();
      searchInput.focus();
      if (isBackspace) {
        searchInput.value = searchInput.value.slice(0, -1);
      } else {
        searchInput.value += e.key;
      }
      handleSearch(searchInput.value);
    }
  });
}

/**
 * Sets up event listeners for the application.
 */
export function setupEventListeners(): void {
  setupGridHoverEffects();
  window.addEventListener("resize", debounce(redrawGrid, 200));
  setupScrollListeners();
  setupSearchListeners();
}

export function clearAlbums(renderedIndices: Set<number>): void {
  const grid = getGridElement();
  if (!grid) return;

  // Remove all children except the dummy scrollbar if it exists
  const children = Array.from(grid.children);
  children.forEach(child => {
    // a more robust check for the scrollbar might be needed
    if ((child as HTMLElement).style.height !== '1px') {
      grid.removeChild(child);
    }
  });

  // Clear all albums, including the scrollbar, when leaving coverflow
  if (getViewMode() !== 'coverflow') {
    grid.innerHTML = '';
  }

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
