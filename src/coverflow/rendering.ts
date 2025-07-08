import { Album } from "../types/types";
import { AlbumCard } from "../components/AlbumCard";
import { getFilteredLibrary } from "../data/albumData";
import { getGridElement } from "../grid/gridLayout";

//controls
const perspective = 1000;
const gap = -85; //75

// A Set to track which indices are currently rendered in coverflow view
const renderedIndices = new Set<number>();


/**
 * Renders albums in a coverflow layout, limiting to a visible range plus buffer.
 */
export function renderCoverflowAlbums(): void {
  const grid = getGridElement();
  if (!grid) return;

  const filteredLibrary = getFilteredLibrary();
  const totalAlbums = filteredLibrary.length;
  
  // Clear any existing grid styling that might interfere with coverflow
  grid.style.height = 'auto';
  grid.style.overflowX = 'auto';
  grid.style.overflowY = 'visible';
  grid.style.whiteSpace = 'nowrap';
  grid.style.display = 'flex';
  grid.style.alignItems = 'center';
  grid.style.justifyContent = 'flex-start';
  grid.style.scrollSnapType = 'x mandatory';
  grid.classList.add('py-40'); // Add padding using Tailwind class to accommodate shadows without breaking snap
  grid.classList.add('coverflow-mode'); // Add class to apply coverflow-specific styles like scrim
  
  // Create scroll indicator container
  let scrollIndicator = grid.parentElement?.querySelector('.scroll-indicator') as HTMLElement;
  if (!scrollIndicator) {
    scrollIndicator = document.createElement('div');
    scrollIndicator.classList.add('scroll-indicator', 'max-w-2xl', 'mx-auto', 'flex', 'justify-between', 'bottom-20', 'absolute', 'left-0', 'right-0', 'px-4', 'z-105');
    scrollIndicator.style.height = '30px';
    // Create 100 indicator lines
    for (let i = 0; i < 80; i++) {
      const line = document.createElement('div');
      line.classList.add('indicator-line', 'bg-white', 'dark:bg-gray-200', 'opacity-30', 'transition-all', 'duration-300', 'ease-out', 'w-[1px]', 'h-3');
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
      albumElement.classList.add('coverflow-item');
      albumElement.classList.add('w-sm');
      albumElement.style.position = 'relative';
      albumElement.style.display = 'inline-block';
      albumElement.style.scrollSnapAlign = 'center';
      albumElement.style.flexShrink = '0';
      
      // Optionally add dataset for tracking
      albumElement.dataset.index = i.toString();

      grid.appendChild(albumElement);
      renderedIndices.add(i);
    }
  }
  
  // Scroll to the middle album to ensure a centered view on initial render
  if (totalAlbums > 0) {
    const middleIndex = Math.floor(totalAlbums / 2);
    const middleElement = grid.querySelector(`[data-index="${middleIndex}"]`) as HTMLElement;
    if (middleElement) {
      middleElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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

  grid.innerHTML = '';
  renderedIndices.clear();
  
  // Remove coverflow-specific class
  grid.classList.remove('coverflow-mode');
  
  // Remove scroll indicator
  const scrollIndicator = grid.parentElement?.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.remove();
  }
  
  // Reset grid styling to default or grid-specific styles
  grid.style.overflowX = '';
  grid.style.overflowY = '';
  grid.style.whiteSpace = '';
  grid.style.display = '';
  grid.style.alignItems = '';
  grid.style.justifyContent = '';
  grid.style.scrollSnapType = '';
}

/**
 * Updates styles for coverflow items based on their position in the viewport.
 * Only styles albums within the visible range (center plus 8 on each side).
 */
export function updateCoverflowStyles(): void {
  const grid = getGridElement();
  if (!grid) return;

  const viewportWidth = window.innerWidth;
  const scrollLeft = grid.scrollLeft;
  const centerX = viewportWidth / 2 + scrollLeft;

  const albumElements = grid.querySelectorAll(".coverflow-item");
  const visibleRange = 8; // Number of albums to style on each side of the center
  let centerIndex = -1;
  let minDistance = Infinity;

  // Find the album closest to the center and mark it, ensuring only one album has the center-album class
  let closestElement: HTMLElement | null = null;
  albumElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const rect = element.getBoundingClientRect();
    const albumCenterX = rect.left + rect.width / 2 + scrollLeft;
    const distanceFromCenter = Math.abs(centerX - albumCenterX);
    if (distanceFromCenter < minDistance) {
      minDistance = distanceFromCenter;
      centerIndex = parseInt(htmlElement.dataset.index || "0", 10);
      closestElement = htmlElement;
    }
    // Apply gradual opacity to text based on how close to center
    const textContainer = htmlElement.querySelector('.text-container') as HTMLElement | null;
    if (textContainer) {
      const maxDistanceForText = viewportWidth / 8; // Full opacity only within 12.5% of viewport width from center
      const textOpacity = Math.max(0, 1 - distanceFromCenter / maxDistanceForText);
      if (textOpacity > 0) {
        textContainer.classList.remove('opacity-0');
        textContainer.style.opacity = textOpacity.toString();
      } else {
        textContainer.classList.add('opacity-0');
        textContainer.style.opacity = '0';
      }
    }
  });
  
  // Update scroll indicator
  const scrollIndicator = grid.parentElement?.querySelector('.scroll-indicator') as HTMLElement;
  if (scrollIndicator) {
    const totalAlbums = albumElements.length;
    const scrollPercentage = scrollLeft / (grid.scrollWidth - viewportWidth);
    const activeLineIndex = Math.floor(scrollPercentage * 99); // 0 to 99 for 100 lines
    const lines = scrollIndicator.querySelectorAll('.indicator-line');
    lines.forEach((line, index) => {
      const lineElement = line as HTMLElement;
      if (index === activeLineIndex) {
        lineElement.style.transform = 'scale(2.5, 2.5)';
        lineElement.style.transformOrigin = 'center';
        lineElement.style.opacity = '1';
      } else {
        lineElement.style.transform = 'scale(1, 1)';
        lineElement.style.transformOrigin = 'center';
        lineElement.style.opacity = '0.3';
      }
    });
  }

  // Remove center-album class from all elements and add it only to the closest one
  albumElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    if (htmlElement === closestElement) {
      htmlElement.classList.add('center-album');
    } else {
      htmlElement.classList.remove('center-album');
    }
  });

  // Update rendered albums based on the center index
  updateCoverflowRenderedAlbums(centerIndex);

  // Determine the range of indices to style
  const startIndex = Math.max(0, centerIndex - visibleRange);
  const endIndex = centerIndex + visibleRange;

  albumElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const index = parseInt(htmlElement.dataset.index || "0", 10);
    const rect = element.getBoundingClientRect();
    const albumCenterX = rect.left + rect.width / 2 + scrollLeft;
    const distanceFromCenter = Math.abs(centerX - albumCenterX);

    // Reset styles by default
    htmlElement.style.transform = 'none';
    htmlElement.style.opacity = '0.5';
    htmlElement.style.marginLeft = `${gap}px`;
    htmlElement.style.marginRight = `${gap}px`;

    // Only apply dynamic styles if within the visible range
    if (index >= startIndex && index <= endIndex) {
      // Calculate a dynamic rotation and scale based on distance from center
      // Max rotation angle will be 60 degrees at a distance of viewportWidth / 2 or more
      const maxDistance = viewportWidth / 2;
      const rotationFactor = Math.min(distanceFromCenter / maxDistance, 1);
      const baseRotationAngle = 30 + rotationFactor * 30; // Starts at 30deg, increases to 60deg
      const opacityValue = 1 - rotationFactor * 0.4; // Opacity decreases from 1 to 0.6
      const scaleValue = 1 - rotationFactor * 0.7; // Scale down to 0.3 as distance increases
      // Calculate z-index based on distance from center, higher for closer to center
      const zIndexValue = Math.floor(100 - rotationFactor * 50); // z-index from 100 (center) to 50 (far)
      htmlElement.style.zIndex = zIndexValue.toString();

      // Apply a gradual rotation even near the center for fluidity
      let rotationAngle = baseRotationAngle;
      if (distanceFromCenter < rect.width / 2) {
        // This album is approximately centered, reduce rotation gradually
        const centerFactor = distanceFromCenter / (rect.width / 2);
        rotationAngle = baseRotationAngle * centerFactor; // Gradually approaches 0 as it nears exact center
      }

      if (distanceFromCenter < rect.width / 2 && distanceFromCenter < 20) {
        // Very close to exact center, no rotation
        htmlElement.style.transform = `perspective(${perspective}px) scale(1)`;
        htmlElement.style.opacity = '1';
      } else if (albumCenterX < centerX) {
        // Album is to the left of center
        htmlElement.style.transform = `perspective(${perspective}px) rotateY(${rotationAngle}deg) scale(${scaleValue})`;
        htmlElement.style.opacity = opacityValue.toString();
      } else {
        // Album is to the right of center
        htmlElement.style.transform = `perspective(${perspective}px) rotateY(-${rotationAngle}deg) scale(${scaleValue})`;
        htmlElement.style.opacity = opacityValue.toString();
      }
    }
  });
}

/**
 * Gets the set of currently rendered indices in coverflow view.
 * @returns Set of indices of rendered albums.
 */
export function getCoverflowRenderedIndices(): Set<number> {
  return renderedIndices;
}
