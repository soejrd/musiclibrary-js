import { Album } from "../types/types";
import { AlbumCard } from "@/components/AlbumCard";
import { getFilteredLibrary } from "../data/albumData";
import { getGridDimensions, getGridElement } from "./gridLayout";

// A Set to track which indices are currently rendered
const renderedIndices = new Set<number>();

/**
 * Gets the range of visible album indices based on current scroll position.
 * @returns Object with start and end indices of visible range.
 */
function getVisibleRange(): { startIndex: number; endIndex: number } {
  const { rowHeight, columns, totalAlbums } = getGridDimensions();
  const bufferRows = 3;
  const scrollTop = window.scrollY;
  const containerHeight = window.innerHeight;

  const startRow = Math.floor(scrollTop / rowHeight) - bufferRows;
  const endRow = Math.ceil((scrollTop + containerHeight) / rowHeight) + bufferRows;

  const safeStartRow = Math.max(0, startRow);
  const safeEndRow = Math.min(Math.ceil(totalAlbums / columns), endRow);

  const startIndex = safeStartRow * columns;
  const endIndex = Math.min(totalAlbums, safeEndRow * columns);

  return { startIndex, endIndex };
}

/**
 * Renders visible albums in the grid using virtual scrolling.
 */
export function renderVisibleAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  const { startIndex, endIndex } = getVisibleRange();
  const { columns, rowHeight, itemWidth } = getGridDimensions();
  const filteredLibrary = getFilteredLibrary();
  const visibleIndices = new Set<number>();

  for (let i = startIndex; i < endIndex; i++) {
    visibleIndices.add(i);
    if (!renderedIndices.has(i)) {
      const album: Album = filteredLibrary[i];

      const albumElement = AlbumCard({
        img: album?.img,
        album: album?.album,
        artist: album?.artist,
        link: album?.link,
      }) as HTMLElement;

      // Position it absolutely
      const row = Math.floor(i / columns);
      const col = i % columns;

      albumElement.style.position = "absolute";
      albumElement.style.top = `${row * rowHeight}px`;
      albumElement.style.left = `${col * itemWidth}px`;
      albumElement.style.width = `${itemWidth}px`;
      albumElement.style.height = `${rowHeight}px`;

      // Optionally add dataset for easy tracking
      albumElement.dataset.index = i.toString();

      grid.appendChild(albumElement);
      renderedIndices.add(i);
    }
  }

  // Remove out-of-view album elements
  renderedIndices.forEach((i) => {
    if (!visibleIndices.has(i)) {
      const el = grid.querySelector(`[data-index='${i}']`) as HTMLElement | null;
      if (el) {
        grid.removeChild(el);
      }
      renderedIndices.delete(i);
    }
  });
}

/**
 * Updates the position and size of already rendered albums after zoom or resize.
 */
export function updateRenderedAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  const { columns, rowHeight, itemWidth } = getGridDimensions();

  renderedIndices.forEach((i) => {
    const el = grid.querySelector(`[data-index='${i}']`) as HTMLElement | null;
    if (el) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      el.style.top = `${row * rowHeight}px`;
      el.style.left = `${col * itemWidth}px`;
      el.style.width = `${itemWidth}px`;
      el.style.height = `${rowHeight}px`;
    }
  });
}

/**
 * Clears all rendered albums from the grid.
 */
export function clearRenderedAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  grid.innerHTML = '';
  renderedIndices.clear();
}

/**
 * Gets the set of currently rendered indices.
 * @returns Set of indices of rendered albums.
 */
export function getRenderedIndices(): Set<number> {
  return renderedIndices;
}
