import { Album } from "../types/types";
import { AlbumCard } from "../components/AlbumCard";
import { getFilteredLibrary } from "../data/albumData";
import { getGridElement } from "../grid/gridLayout";

//controls
const perspective = 1000;
const gap = -100;

// A Set to track which indices are currently rendered in coverflow view
const renderedIndices = new Set<number>();

// Cache for coverflow measurements to avoid recalculations
const measurementCache = new Map<number, {
  rect: DOMRect;
  centerX: number;
  distance: number;
}>();

// Throttle update frequency (ms)
const UPDATE_THROTTLE = 16; // ~60fps
let lastUpdateTime = 0;

/**
 * Renders albums in a coverflow layout, limiting to a visible range plus buffer.
 */
export function renderCoverflowAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  const filteredLibrary = getFilteredLibrary();
  const totalAlbums = filteredLibrary.length;

  // Clear any existing grid styling that might interfere with coverflow
  grid.style.height = "auto";
  grid.style.overflowX = "auto";
  grid.style.overflowY = "visible";
  grid.style.whiteSpace = "nowrap";
  grid.style.display = "flex";
  grid.style.alignItems = "center";
  grid.style.justifyContent = "flex-start";
  grid.style.scrollSnapType = "x mandatory";
  grid.classList.add("py-40"); // Add padding using Tailwind class to accommodate shadows without breaking snap
  grid.classList.add("coverflow-mode"); // Add class to apply coverflow-specific styles like scrim

  // Create scroll indicator container
  let scrollIndicator = grid.parentElement?.querySelector(
    ".scroll-indicator"
  ) as HTMLElement;
  if (!scrollIndicator) {
    scrollIndicator = document.createElement("div");
    scrollIndicator.classList.add(
      "scroll-indicator",
      "max-w-2xl",
      "mx-auto",
      "flex",
      "justify-between",
      "bottom-20",
      "absolute",
      "left-0",
      "right-0",
      "px-4",
      "z-105"
    );
    scrollIndicator.style.height = "30px";
    // Create 100 indicator lines
    for (let i = 0; i < 80; i++) {
      const line = document.createElement("div");
      line.classList.add(
        "indicator-line",
        "bg-zinc-950",
        "dark:bg-gray-200",
        "opacity-30",
        "transition-all",
        "duration-300",
        "ease-out",
        "w-[1px]",
        "h-3"
      );
      // line.style.width = '1px';
      // line.style.height = '12px';
      line.dataset.index = i.toString();
      scrollIndicator.appendChild(line);
    }
    if (grid.parentElement) {
      grid.parentElement.insertBefore(scrollIndicator, grid);
    }
  }

  // Render all albums to prevent scrolling issues
  for (let i = 0; i < totalAlbums; i++) {
    if (!renderedIndices.has(i)) {
      const album: Album = filteredLibrary[i];
      const albumElement = AlbumCard({
        img: album?.img,
        album: album?.album,
        artist: album?.artist,
        link: album?.link,
      }) as HTMLElement;

      // Apply coverflow-specific class for CSS styling
      albumElement.classList.add("coverflow-item");
      albumElement.classList.add("w-sm");
      albumElement.style.position = "relative";
      albumElement.style.display = "inline-block";
      albumElement.style.scrollSnapAlign = "center";
      albumElement.style.flexShrink = "0";

      // Optionally add dataset for tracking
      albumElement.dataset.index = i.toString();

      grid.appendChild(albumElement);
      renderedIndices.add(i);
    }
  }

  // Scroll to the 5th album to ensure proper perspective effect
  if (totalAlbums > 5) {
    const fifthElement = grid.querySelector(
      `[data-index="4"]`
    ) as HTMLElement;
    if (fifthElement) {
      fifthElement.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "center",
      });
    }
  }
}

/**
 * Updates the rendered albums in coverflow view based on scroll position.
 * @param centerIndex The index of the album closest to the viewport center.
 */
export function updateCoverflowRenderedAlbums(centerIndex: number): void {
  const grid = getGridElement();
  if (!grid) return;

  const filteredLibrary = getFilteredLibrary();
  const totalAlbums = filteredLibrary.length;
  // No removal of albums; once rendered, they stay in the DOM to prevent scrolling issues
  // This function now only updates the center index for styling purposes
}

/**
 * Clears all rendered albums from the coverflow view.
 */
export function clearCoverflowAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  grid.innerHTML = "";
  renderedIndices.clear();

  // Remove coverflow-specific class
  grid.classList.remove("coverflow-mode");

  // Remove scroll indicator
  const scrollIndicator =
    grid.parentElement?.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.remove();
  }

  // Reset grid styling to default or grid-specific styles
  grid.style.overflowX = "";
  grid.style.overflowY = "";
  grid.style.whiteSpace = "";
  grid.style.display = "";
  grid.style.alignItems = "";
  grid.style.justifyContent = "";
  grid.style.scrollSnapType = "";
}

/**
 * Updates styles for coverflow items based on their position in the viewport.
 * Only styles albums within the visible range (center plus 8 on each side).
 */
export function updateCoverflowStyles(): void {
  const now = performance.now();
  if (now - lastUpdateTime < UPDATE_THROTTLE) {
    return;
  }
  lastUpdateTime = now;

  const grid = getGridElement();
  if (!grid) return;

  // Batch all DOM reads first
  const viewportWidth = window.innerWidth;
  const scrollLeft = grid.scrollLeft;
  const centerX = viewportWidth / 2 + scrollLeft;
  const albumElements = grid.querySelectorAll(".coverflow-item");
  const visibleRange = 5; // Number of albums to style on each side of the center
  let centerIndex = -1;
  let minDistance = Infinity;

  // First pass: Collect all measurements and find center element
  const measurements: {
    element: HTMLElement;
    rect: DOMRect;
    centerX: number;
    distance: number;
    index: number;
  }[] = [];

  albumElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const index = parseInt(htmlElement.dataset.index || "0", 10);
    
    // Get fresh measurements during scroll for fluid animations
    const rect = element.getBoundingClientRect();
    const albumCenterX = rect.left + rect.width / 2 + scrollLeft;
    const distanceFromCenter = Math.abs(centerX - albumCenterX);
    
    // Store in cache (used for initial render)
    measurementCache.set(index, { rect, centerX: albumCenterX, distance: distanceFromCenter });

    measurements.push({
      element: htmlElement,
      rect,
      centerX: albumCenterX,
      distance: distanceFromCenter,
      index
    });

    if (distanceFromCenter < minDistance) {
      minDistance = distanceFromCenter;
      centerIndex = parseInt(htmlElement.dataset.index || "0", 10);
    }
  });

  // Batch all DOM writes
  requestAnimationFrame(() => {
    // Update scroll indicator
    const scrollIndicator = grid.parentElement?.querySelector(
      ".scroll-indicator"
    ) as HTMLElement;
    if (scrollIndicator) {
      const totalAlbums = albumElements.length;
      const scrollPercentage = scrollLeft / (grid.scrollWidth - viewportWidth);
      const activeLineIndex = Math.floor(scrollPercentage * 99);
      const lines = scrollIndicator.querySelectorAll(".indicator-line");
      lines.forEach((line, index) => {
        const lineElement = line as HTMLElement;
        if (index === activeLineIndex) {
          lineElement.style.transform = "scale(2.5, 2.5)";
          lineElement.style.opacity = "1";
        } else {
          lineElement.style.transform = "scale(1, 1)";
          lineElement.style.opacity = "0.3";
        }
      });
    }

    // Determine the range of indices to style
    const startIndex = Math.max(0, centerIndex - visibleRange);
    const endIndex = centerIndex + visibleRange;

    measurements.forEach(
      ({
        element,
        rect,
        centerX: albumCenterX,
        distance: distanceFromCenter,
      }) => {
        const index = parseInt(element.dataset.index || "0", 10);

        // Reset styles by default
        element.style.transform = "none";
        element.style.opacity = "1";
        element.style.marginLeft = `${gap}px`;
        element.style.marginRight = `${gap}px`;

        // Only apply dynamic styles if within the visible range
        if (index >= startIndex && index <= endIndex) {
          // Calculate a dynamic rotation and scale based on distance from center
          const maxDistance = viewportWidth / 2;
          const rotationFactor = Math.min(distanceFromCenter / maxDistance, 1);
          const baseRotationAngle = 30 + rotationFactor * 30;
          const scaleValue = 1 - rotationFactor * 0.7;
          const zIndexValue = Math.floor(100 - rotationFactor * 50);
          element.style.zIndex = zIndexValue.toString();

          // Apply a gradual rotation even near the center for fluidity
          let rotationAngle = baseRotationAngle;
          if (distanceFromCenter < rect.width / 2) {
            const centerFactor = distanceFromCenter / (rect.width / 2);
            rotationAngle = baseRotationAngle * centerFactor;
          }

          if (distanceFromCenter < rect.width / 2 && distanceFromCenter < 20) {
            // Very close to exact center, no rotation
            element.style.transform = `perspective(${perspective}px) scale(1)`;
          } else if (albumCenterX < centerX) {
            // Album is to the left of center
            element.style.transform = `perspective(${perspective}px) rotateY(${rotationAngle}deg) scale(${scaleValue})`;
          } else {
            // Album is to the right of center
            element.style.transform = `perspective(${perspective}px) rotateY(-${rotationAngle}deg) scale(${scaleValue})`;
          }
        }

        // Apply text opacity based on distance from center
        const textContainer = element.querySelector(
          ".text-container"
        ) as HTMLElement | null;
        if (textContainer) {
          const maxDistanceForText = viewportWidth / 8;
          const textOpacity = Math.max(
            0,
            1 - distanceFromCenter / maxDistanceForText
          );
          if (textOpacity > 0) {
            textContainer.classList.remove("opacity-0");
            textContainer.style.opacity = textOpacity.toString();
          } else {
            textContainer.classList.add("opacity-0");
            textContainer.style.opacity = "0";
          }
        }
      }
    );
  });
}

/**
 * Gets the set of currently rendered indices in coverflow view.
 * @returns Set of indices of rendered albums.
 */
export function getCoverflowRenderedIndices(): Set<number> {
  return renderedIndices;
}
