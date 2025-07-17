import { Album } from "../types/types";
import { AlbumCard } from "../components/AlbumCard";
import { getFilteredLibrary } from "../data/albumData";
import { getGridElement } from "../grid/gridLayout";
import { clearAlbums } from "../events/eventHandlers";

//controls
const perspective = 1000;
const gap = -100;
const INDICATOR_LINES = 80;

// A Set to track which indices are currently rendered in coverflow view
const renderedIndices = new Set<number>();

// Throttle update frequency (ms)
const UPDATE_THROTTLE = 16; // ~60fps
let lastUpdateTime = 0;

/**
 * Renders an initial small set of albums for the coverflow layout.
 * The rest of the albums will be rendered on-demand as the user scrolls.
 */
export function renderCoverflowAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  const filteredLibrary = getFilteredLibrary();
  const totalAlbums = filteredLibrary.length;
  const initialRenderCount = Math.min(totalAlbums, 20); // Render up to 20 albums initially

  // A dummy scrollbar element to set the scrollable width
  const scrollbar = document.createElement("div");
  scrollbar.style.width = `${totalAlbums * 150}px`; // Approximate width
  scrollbar.style.height = "1px";
  grid.appendChild(scrollbar);

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
    // Create indicator lines
    for (let i = 0; i < INDICATOR_LINES; i++) {
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
      line.dataset.index = i.toString();
      scrollIndicator.appendChild(line);
    }
    if (grid.parentElement) {
      grid.parentElement.insertBefore(scrollIndicator, grid);
    }
    scrollIndicator.addEventListener("click", (e) =>
      handleScrollIndicatorClick(e, grid, totalAlbums)
    );
  }

  // Render initial albums
  for (let i = 0; i < initialRenderCount; i++) {
    const album: Album = filteredLibrary[i];
    const albumElement = createAlbumElement(album, i);
    grid.appendChild(albumElement);
    renderedIndices.add(i);
  }

  // Scroll to the 5th album to ensure proper perspective effect
  if (totalAlbums > 5) {
    const fifthElement = grid.querySelector(`[data-index="4"]`) as HTMLElement;
    if (fifthElement) {
      fifthElement.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "center",
      });
    }
  }

  // Manually trigger style update after initial render and scroll
  updateCoverflowStyles();
}

/**
 * Clears all rendered albums from the coverflow view.
 */
export function clearCoverflowAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  // More performant and safer way to clear children
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  renderedIndices.clear();
}

/**
 * Creates an album element for coverflow view.
 * @param album - The album data.
 * @param index - The index of the album.
 * @returns The created HTMLElement.
 */
function createAlbumElement(album: Album, index: number): HTMLElement {
  const albumElement = AlbumCard({
    img: album?.img,
    album: album?.album,
    artist: album?.artist,
    link: album?.link,
  }) as HTMLElement;

  albumElement.classList.add("coverflow-item", "w-sm");
  albumElement.style.position = "absolute"; // Use absolute positioning
  albumElement.style.display = "inline-block";
  albumElement.style.scrollSnapAlign = "center";
  albumElement.style.flexShrink = "0";
  albumElement.dataset.index = index.toString();

  // Position the element based on its index
  const baseWidth = 150; // Approximate width of an item
  albumElement.style.left = `${index * baseWidth}px`;

  return albumElement;
}

/**
 * Updates styles and manages rendered albums for coverflow view.
 * Implements virtualization to only render and style visible albums.
 */
export function updateCoverflowStyles(): void {
  const now = performance.now();
  if (now - lastUpdateTime < UPDATE_THROTTLE) {
    return;
  }
  lastUpdateTime = now;

  const grid = getGridElement();
  if (!grid) return;

  const filteredLibrary = getFilteredLibrary();
  const totalAlbums = filteredLibrary.length;
  const viewportWidth = window.innerWidth;
  const scrollLeft = grid.scrollLeft;
  const centerX = viewportWidth / 2 + scrollLeft;
  const visibleRange = 10; // Render 10 albums on each side of the center
  const baseWidth = 150; // Approximate width of an item

  // Estimate the center index based on scroll position
  const centerIndex = Math.floor(scrollLeft / baseWidth);

  // Determine the range of indices that should be visible
  const startIndex = Math.max(0, centerIndex - visibleRange);
  const endIndex = Math.min(totalAlbums - 1, centerIndex + visibleRange);

  const requiredIndices = new Set<number>();
  for (let i = startIndex; i <= endIndex; i++) {
    requiredIndices.add(i);
  }

  // --- DOM Reconciliation ---
  // Remove albums that are no longer in the required range
  renderedIndices.forEach((index) => {
    if (!requiredIndices.has(index)) {
      const elementToRemove = grid.querySelector(`[data-index="${index}"]`);
      if (elementToRemove) {
        grid.removeChild(elementToRemove);
      }
      renderedIndices.delete(index);
    }
  });

  // Add albums that are in the required range but not yet rendered
  requiredIndices.forEach((index) => {
    if (!renderedIndices.has(index)) {
      const album = filteredLibrary[index];
      const albumElement = createAlbumElement(album, index);
      grid.appendChild(albumElement);
      renderedIndices.add(index);
    }
  });

  // --- Style Updates ---
  const albumElements = grid.querySelectorAll(".coverflow-item");

  requestAnimationFrame(() => {
    // Update scroll indicator
    const scrollIndicator = grid.parentElement?.querySelector(
      ".scroll-indicator"
    ) as HTMLElement;
    if (scrollIndicator) {
      const totalContentWidth = totalAlbums * baseWidth;
      const scrollPercentage =
        scrollLeft / (totalContentWidth - viewportWidth);
      const activeLineIndex = Math.floor(
        scrollPercentage * (INDICATOR_LINES - 1)
      );
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
    
    albumElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const index = parseInt(htmlElement.dataset.index || "0", 10);

      const rect = htmlElement.getBoundingClientRect();
      const albumCenterX = rect.left + rect.width / 2 + scrollLeft;
      const distanceFromCenter = Math.abs(centerX - albumCenterX);

      // Reset styles by default
      htmlElement.style.transform = "none";
      htmlElement.style.opacity = "1";
      htmlElement.style.marginLeft = `${gap}px`;
      htmlElement.style.marginRight = `${gap}px`;

      // Calculate a dynamic rotation and scale based on distance from center
      const maxDistance = viewportWidth / 2;
      const rotationFactor = Math.min(distanceFromCenter / maxDistance, 1);
      const baseRotationAngle = 30 + rotationFactor * 30;
      const scaleValue = 1 - rotationFactor * 0.7;
      const zIndexValue = Math.floor(100 - rotationFactor * 50);
      htmlElement.style.zIndex = zIndexValue.toString();

      // Apply a gradual rotation even near the center for fluidity
      let rotationAngle = baseRotationAngle;
      if (distanceFromCenter < rect.width / 2) {
        const centerFactor = distanceFromCenter / (rect.width / 2);
        rotationAngle = baseRotationAngle * centerFactor;
      }

      if (distanceFromCenter < rect.width / 2 && distanceFromCenter < 20) {
        htmlElement.style.transform = `perspective(${perspective}px) scale(1)`;
      } else if (albumCenterX < centerX) {
        htmlElement.style.transform = `perspective(${perspective}px) rotateY(${rotationAngle}deg) scale(${scaleValue})`;
      } else {
        htmlElement.style.transform = `perspective(${perspective}px) rotateY(-${rotationAngle}deg) scale(${scaleValue})`;
      }

      // Apply text opacity based on distance from center
      const textContainer = htmlElement.querySelector(
        ".text-container"
      ) as HTMLElement | null;
      if (textContainer) {
        const maxDistanceForText = viewportWidth / 16;
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
    });
  });
}

/**
 * Calculates the target scroll position based on a click event on the scroll indicator.
 *
 * @param e - The mouse event from the click.
 * @param grid - The grid container element.
 * @param totalAlbums - The total number of albums.
 */
function handleScrollIndicatorClick(
  e: MouseEvent,
  grid: HTMLElement,
  totalAlbums: number
): void {
  const baseWidth = 150;
  const viewportWidth = window.innerWidth;
  const indicatorRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = e.clientX - indicatorRect.left;
  const clickPercentage = clickX / indicatorRect.width;

  // Calculate the total width of the content, including gaps
  const totalContentWidth = totalAlbums * (baseWidth + Math.abs(gap));

  // Determine the target scroll position
  const targetScrollLeft = clickPercentage * (totalContentWidth - viewportWidth);

  // Find the album index closest to the click position
  const targetIndex = Math.floor(
    (targetScrollLeft + viewportWidth / 2) / (baseWidth + Math.abs(gap))
  );

  // Get the target album element
  const targetAlbum = grid.querySelector(
    `[data-index="${targetIndex}"]`
  ) as HTMLElement;

  if (targetAlbum) {
    // Calculate the exact position to scroll to center the album
    const targetAlbumLeft = targetAlbum.offsetLeft;
    const targetAlbumWidth = targetAlbum.offsetWidth;
    const scrollToPosition =
      targetAlbumLeft - viewportWidth / 2 + targetAlbumWidth / 2;

    grid.scrollTo({
      left: scrollToPosition,
      behavior: "smooth",
    });
  } else {
    // Fallback for unrendered albums
    grid.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }
}

/**
 * Gets the set of currently rendered indices in coverflow view.
 * @returns Set of indices of rendered albums.
 */
export function getCoverflowRenderedIndices(): Set<number> {
  return renderedIndices;
}
