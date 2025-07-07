import { Album } from "../types/types";

let library: Album[] = [];
let filteredLibrary: Album[] = [];

/**
 * Fetches album data from the library JSON file.
 * @returns Promise resolving to the array of albums.
 */
export async function fetchAlbums(): Promise<Album[]> {
  try {
    const response = await fetch("/library_full.json");
    if (!response.ok) {
      throw new Error("Failed to load album data from /library_full.json");
    }
    library = await response.json();
    console.log("Loaded library:", library.length, "albums");
    filteredLibrary = library;
    return library;
  } catch (error) {
    console.error("Error loading album data:", error);
    // Fallback to a small dataset if fetch fails
    library = [
      {
        "album": "Spicy Salad",
        "n": 6,
        "img": "https://i.scdn.co/image/ab67616d0000b2737c884060b5049a77856bacf8",
        "artist": "Tuna Salad",
        "link": "spotify:album:5WbxjpioUPIBF4ULMKvUbF",
        "toDelete": false
      },
      {
        "album": "Section.80",
        "n": 16,
        "img": "https://i.scdn.co/image/ab67616d0000b27333d50ba80791b4ed381f5221",
        "artist": "Kendrick Lamar",
        "link": "spotify:album:13WjgUEEAQp0d9JqojlWp1",
        "toDelete": true
      },
      {
        "album": "InnerSpeaker",
        "n": 11,
        "img": "https://i.scdn.co/image/ab67616d0000b273cbcddf5b9309f972363ae406",
        "artist": "Tame Impala",
        "link": "spotify:album:79Ij6ZNKHVFVRNvXoNbvZO",
        "toDelete": false
      }
    ];
    console.log("Using fallback data with", library.length, "albums");
    filteredLibrary = library;
    return library;
  }
}

/**
 * Filters albums based on the search term.
 * @param searchTerm - The term to filter albums by.
 */
export function filterAlbums(searchTerm: string): void {
  if (!searchTerm) {
    filteredLibrary = library;
    return;
  }
  const term = searchTerm.toLowerCase();
  filteredLibrary = library.filter(album => {
    const albumName = album.album.toLowerCase();
    const artistName = album.artist.toLowerCase();
    // Simple fuzzy match allowing for close matches
    return albumName.includes(term) || artistName.includes(term) ||
           albumName.includes(term.slice(0, -1)) || artistName.includes(term.slice(0, -1)) ||
           (term.length > 1 && (albumName.includes(term.slice(1)) || artistName.includes(term.slice(1))));
  });
}

/**
 * Gets the current filtered library of albums.
 * @returns The array of filtered albums.
 */
export function getFilteredLibrary(): Album[] {
  return filteredLibrary;
}

/**
 * Gets the total number of albums in the filtered library.
 * @returns The count of filtered albums.
 */
export function getTotalAlbums(): number {
  return filteredLibrary.length;
}

/**
 * Shuffles the library array in a performance-oriented way.
 */
export function shuffleLibrary(): void {
  for (let i = library.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [library[i], library[j]] = [library[j], library[i]];
  }
  // Update filtered library if it's currently the full library
  if (filteredLibrary === library) {
    filteredLibrary = library;
  }
}
