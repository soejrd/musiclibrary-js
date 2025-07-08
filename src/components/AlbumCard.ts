import { Album } from "../types/types";

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
  card.className = 'album-card relative overflow-hidden flex flex-col p-2 transition-all duration-500 ease-out group hover:z-20';

  // Determine if in coverflow mode by checking the grid container's view mode
  const grid = document.getElementById("grid");
  const isCoverflow = grid && grid.style.display === 'flex' && grid.style.overflowX === 'auto';

  if (isCoverflow) {
    // Layout for coverflow mode: title and artist under the image, visibility handled by CSS for center album
    card.innerHTML = `
      <div class="wrapper w-full flex flex-col relative rounded-sm overflow-hidden group-hover:shadow-md transition-all duration-200 ease-out">
        <div class="album-image w-full h-auto object-cover flex-shrink-0">
          <img class="w-full object-cover" loading="lazy" src="${imageUrl || ''}" alt="${albumName || 'Album'}">
          <div class="animate-pulse bg-zinc-800 h-full w-full object-cover"></div>
        </div>
        <div class="text-container mt-2 flex flex-col opacity-0 transition-opacity duration-100 ease-out">
          <h3 class="text-xl font-bold text-zinc-100 mb-1 truncate">${albumName || 'Unknown Album'}</h3>
          <p class="text-base text-zinc-300 truncate">${artistName || 'Unknown Artist'}</p>
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
