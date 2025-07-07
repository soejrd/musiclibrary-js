/**
 * Creates an album card element with the given properties.
 * @param {Object} props - The properties for the album card.
 * @param {string} props.imageUrl - The URL of the album image.
 * @param {string} props.albumName - The name of the album.
 * @param {string} props.artistName - The name of the artist.
 * @param {string} props.link - The link to open when the card is clicked.
 * @returns {HTMLElement} The album card element.
 */
export function AlbumCard({ imageUrl, albumName, artistName, link }) {
  const card = document.createElement('a');
  card.setAttribute('target', '_blank');
  card.setAttribute('rel', 'noopener noreferrer');
  card.setAttribute('href', link || '#');
  card.className = 'album-card relative overflow-hidden flex flex-col p-2 transition-all duration-500 ease-out group hover:z-1';

  card.innerHTML = `
    <div class="wrapper w-full h-full flex flex-col relative rounded-sm overflow-hidden group-hover:shadow-md transition-all duration-200 ease-out">
      <div class="album-image w-full h-full object-cover flex-shrink-0">
        <img class="w-full object-cover" loading="lazy" src="${imageUrl || ''}" alt="${albumName || 'Album'}">
        <div class="animate-pulse bg-zinc-800 h-full w-full object-cover"></div>
      </div>
      <div class="scrim absolute top-0 left-0 w-full h-full bg-linear-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-all duration-0 ease-out"></div>
      <div class="p-2 flex flex-col justify-between flex-grow absolute bottom-0 group-hover:opacity-100 opacity-0 translate-y-1 group-hover:translate-y-0 transition-all duration-100 ease-out">
        <h3 class="font-bold text-zinc-100 mb-1 truncate">${albumName || 'Unknown Album'}</h3>
        <p class="text-xs text-zinc-300 truncate mb-1">${artistName || 'Unknown Artist'}</p>
      </div>
    </div>
  `;

  return card;
}
