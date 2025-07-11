import { get } from "http";
import { updateCoverflowStyles } from "../coverflow/rendering";

let container: HTMLElement | null = null;
let grid: HTMLElement | null = null;
let zoomLevel: number = 3;
const zoomMin: number = 1;
const zoomMax: number = 5;
let columns: number = 0;
let rows: number = 0;
let rowHeight: number = 176;
let itemWidth: number = 176;
let gridHeight: number = 0;
let totalAlbums: number = 0;
let viewMode: "grid" | "coverflow" = "grid";

/**
 * Initializes the grid container and calculates initial layout.
 */
export function initGrid(): void {
  container = document.querySelector("main");
  grid = document.querySelector("#grid");
  if (!container || !grid) {
    console.error("Grid container or grid element not found");
    return;
  }
  updateItemSize();
  calculateGridLayout(0); // Initial total albums will be updated later
}

/**
 * Updates the size of grid items based on the current zoom level.
 */
export function updateItemSize(): void {
  if (!container) return;
  // Map zoom levels to desired number of items per row
  const itemsPerRowMap: { [key: number]: number } = {
    1: 8, // smallest items, approx 98px wide
    2: 7, // approx 121px wide
    3: 5, // approx 156px wide
    4: 4, // approx 213px wide
    5: 2, // largest items, approx 328px wide
  };
  const desiredColumns = itemsPerRowMap[zoomLevel];
  const containerWidth = container.offsetWidth;
  const gap = 16; // Assume a gap of 16px between items, adjust as needed
  // Calculate item width to fit the desired number of columns, accounting for gaps
  itemWidth = Math.floor(
    (containerWidth - (desiredColumns - 1) * gap) / desiredColumns
  );
  rowHeight = itemWidth; // square albums
}

/**
 * Calculates the grid layout based on the total number of albums.
 * @param total - The total number of albums to layout.
 */
export function calculateGridLayout(total: number): void {
  if (!container || !grid) return;
  totalAlbums = total;
  columns = Math.floor(container.offsetWidth / itemWidth);
  rows = Math.ceil(totalAlbums / columns);
  gridHeight = rows * itemWidth;
  grid.style.height = `${gridHeight}px`;
}

/**
 * Increases the zoom level if possible.
 * @returns True if zoom level changed, false otherwise.
 */
export function zoomIn(): boolean {
  if (zoomLevel < zoomMax) {
    zoomLevel++;
    return true;
  }
  return false;
}

/**
 * Decreases the zoom level if possible.
 * @returns True if zoom level changed, false otherwise.
 */
export function zoomOut(): boolean {
  if (zoomLevel > zoomMin) {
    zoomLevel--;
    return true;
  }
  return false;
}

/**
 * Gets the current grid dimensions and item sizes.
 * @returns Object containing grid layout properties.
 */
export function getGridDimensions(): {
  columns: number;
  rowHeight: number;
  itemWidth: number;
  totalAlbums: number;
} {
  return { columns, rowHeight, itemWidth, totalAlbums };
}

/**
 * Gets the grid element.
 * @returns The grid HTMLElement or null if not initialized.
 */
export function getGridElement(): HTMLElement | null {
  return grid;
}

/**
 * Sets the current view mode.
 * @param mode - The view mode to set ('grid' or 'coverflow').
 */
export function setViewMode(mode: "grid" | "coverflow"): void {
  let coverflowClassList = ["coverflow-mode", "py-40","h-auto", "overflow-x-auto", "overflow-y-visible", "whitespace-nowrap", "flex", "items-center", "justify-start", "snap-x", "snap-mandatory"];
  let gridClassList = ["grid-mode", "mt-30"];
  const grid = getGridElement();
  if (!grid) return;
  viewMode = mode;

  if (mode === "grid") {
    // Remove scroll indicator
    const scrollIndicator =
      grid.parentElement?.querySelector(".scroll-indicator");
    if (scrollIndicator) {
      scrollIndicator.remove();
    }
    grid.classList.remove(...coverflowClassList);
    grid.classList.add(...gridClassList);

  } else {
    grid.classList.remove(...gridClassList);
    grid.classList.add(...coverflowClassList);
    updateCoverflowStyles();
    grid.style.height = "auto";
  }
}

/**
 * Gets the current view mode.
 * @returns The current view mode ('grid' or 'coverflow').
 */
export function getViewMode(): "grid" | "coverflow" {
  return viewMode;
}
