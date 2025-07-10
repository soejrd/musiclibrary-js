import { Album } from "../types/types";
import { getViewMode } from "@/grid/gridLayout";

/**
 * Creates an album card element with the given properties.
 * @param props - The properties for the album card.
 * @param props.imageUrl - The URL of the album image.
 * @param props.albumName - The name of the album.
 * @param props.artistName - The name of the artist.
 * @param props.link - The link to open when the card is clicked.
 * @returns The album card element.
 */
export function AlbumCard({ img: imageUrl, album: albumName, artist: artistName, link }: Partial<Album>): HTMLElement {
  const card = document.createElement('a') as HTMLAnchorElement;
  card.setAttribute('target', '_blank');
  card.setAttribute('rel', 'noopener noreferrer');
  card.setAttribute('href', link || '#');
  card.className = 'album-card relative flex flex-col p-2 transition-all duration-500 ease-out group hover:z-20';

  const viewMode = getViewMode();

    if (viewMode == "coverflow") {
      // Layout for coverflow mode: title and artist under the image, visibility handled by CSS for center album
      card.innerHTML = `
      <div class="wrapper w-full flex flex-col relative rounded-sm group-hover:scale-105 transition-all duration-200 ease-out overflow-visible">
        <div class="album-image w-full h-auto object-cover flex-shrink-0 relative overflow-visible">
          <img class="w-full object-cover" loading="lazy" src="${imageUrl || ''}" alt="${albumName || 'Album'}">
          <img class="album-image--shadow group-hover:opacity-12 group-hover:blur-[64px] w-full object-cover pointer-events-none absolute top-0 left-0 transform -scale-200 transform-origin-center -z-1 opacity-0 transition-all duration-[1s] ease-out" loading="lazy" src="${imageUrl || ''}" alt="${albumName || 'Album'}">
          <div class="animate-pulse bg-zinc-800 h-full w-full object-cover"></div>
        </div>
        <div class="text-container mt-6 flex flex-col opacity-0 transition-opacity duration-100 ease-out">
          <h3 class="text-4xl font-bold dark:text-zinc-100 text-zinc-950 mb-2 truncate">${albumName || 'Unknown Album'}</h3>
          <p class="text-lg dark:text-zinc-300 text-zinc-600 truncate">${artistName || 'Unknown Artist'}</p>
        </div>
      </div>
    `;
    // CSS will handle visibility for center album
  } else {
    // Layout for grid mode: title and artist on top of the image
    card.innerHTML = `
      <div class="wrapper w-full h-full flex flex-col relative rounded-sm overflow-hidden group-hover:shadow-md transition-all duration-200 ease-out">
        <div class="album-image w-full h-full object-cover flex-shrink-0">
          <img class="w-full object-cover" loading="lazy" src="${imageUrl || ''}" alt="${albumName || 'Album'}">
          <div class="animate-pulse bg-zinc-800 h-full w-full object-cover"></div>
        </div>
        <div class="scrim absolute top-0 left-0 w-full h-full bg-linear-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-all duration-100 ease-out"></div>
        <div class="p-2 flex flex-col justify-between flex-grow absolute bottom-0 group-hover:opacity-100 opacity-0 translate-y-1 group-hover:translate-y-0 transition-all duration-100 ease-out">
          <h3 class="font-bold text-zinc-100 mb-1 truncate">${albumName || 'Unknown Album'}</h3>
          <p class="text-xs text-zinc-300 truncate mb-1">${artistName || 'Unknown Artist'}</p>
        </div>
      </div>
    `;
  }

  return card;
}
