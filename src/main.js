// import { AlbumCard } from "./components/AlbumCard.js";

// let grid;
// let container;
// let albums = [];
// let library;
// let zoomLevel = 3;
// const zoomMin = 1;
// const zoomMax = 5;
// let columns;
// let rows;
// let rowHeight = 176;
// let totalAlbums;
// let gridHeight;
// let itemWidth = 176;

// function updateItemSize() {
//   // Map zoom levels to desired number of items per row
//   const itemsPerRowMap = {
//     1: 8, // smallest items
//     2: 6,
//     3: 5, // as requested, 5 items per row at zoom level 3
//     4: 4,
//     5: 3  // largest items
//   };
//   const desiredColumns = itemsPerRowMap[zoomLevel];
//   const containerWidth = container.offsetWidth;
//   const gap = 16; // Assume a gap of 16px between items, adjust as needed
//   // Calculate item width to fit the desired number of columns, accounting for gaps
//   itemWidth = Math.floor((containerWidth - (desiredColumns - 1) * gap) / desiredColumns);
//   rowHeight = itemWidth; // square albums
// }

// document.getElementById("zoomInBtn").addEventListener("click", () => {
//   if (zoomLevel < zoomMax) {
//     zoomLevel++;
//     handleZoomChange();
//   }
// });

// document.getElementById("zoomOutBtn").addEventListener("click", () => {
//   if (zoomLevel > zoomMin) {
//     zoomLevel--;
//     handleZoomChange();
//   }
// });

// // Shuffle the library array in a performance-oriented way
// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
// }

// document.getElementById("shuffleBtn").addEventListener("click", () => {
//   shuffleArray(library);
//   // Clear currently rendered elements
//   grid.innerHTML = '';
//   renderedIndices.clear();
//   // Re-render visible albums with new order
//   renderVisibleAlbums();
// });


// function handleZoomChange() {
//   updateItemSize();
//   calculateGridLayout();
//   // Update styles for already rendered albums
//   renderedIndices.forEach((i) => {
//     const el = grid.querySelector(`[data-index='${i}']`);
//     if (el) {
//       const row = Math.floor(i / columns);
//       const col = i % columns;
//       el.style.top = `${row * rowHeight}px`;
//       el.style.left = `${col * itemWidth}px`;
//       el.style.width = `${itemWidth}px`;
//       el.style.height = `${rowHeight}px`;
//     }
//   });
//   renderVisibleAlbums();
// }

// function debounce(func, wait) {
//   let timeout;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// }

// window.addEventListener(
//   "resize",
//   debounce(() => {
//     calculateGridLayout();
//     renderVisibleAlbums();
//   }, 200)
// );

// // Function to fetch album data from library.json
// async function fetchAlbums() {
//   try {
//     const response = await fetch("/src/library.json");
//     if (!response.ok) {
//       throw new Error("Failed to load album data");
//     }
//     library = await response.json();
//     console.log(library);
//     return library;
//   } catch (error) {
//     console.error(error);
//     library = [];
//   }
// }



// function initGrid() {
//   container = document.querySelector("main");
//   grid = document.querySelector("#grid");
//   totalAlbums = filteredLibrary.length;

//   columns = Math.floor(container.offsetWidth / itemWidth);
//   rows = Math.ceil(filteredLibrary.length / columns);
//   gridHeight = rows * itemWidth;
//   console.log(columns, gridHeight);
//   calculateGridLayout();
// }

// function calculateGridLayout() {
//   //When to run: On resize or zoom changes.
//   const containerWidth = container.offsetWidth;
//   columns = Math.floor(containerWidth / itemWidth);
//   rows = Math.ceil(filteredLibrary.length / columns);
//   gridHeight = rows * itemWidth;
//   grid.style.height = `${gridHeight}px`;
//   renderVisibleAlbums();
// }

// function getVisibleRange() {
//   const bufferRows = 3;
//   const scrollTop = window.scrollY;
//   const containerHeight = window.innerHeight;

//   const startRow = Math.floor(scrollTop / rowHeight) - bufferRows;
//   const endRow =
//     Math.ceil((scrollTop + containerHeight) / rowHeight) + bufferRows;

//   const safeStartRow = Math.max(0, startRow);
//   const safeEndRow = Math.min(Math.ceil(totalAlbums / columns), endRow);

//   const startIndex = safeStartRow * columns;
//   const endIndex = Math.min(totalAlbums, safeEndRow * columns);

//   return { startIndex, endIndex };
// }

// // A Set to track which indices are currently rendered
// const renderedIndices = new Set();

// function renderVisibleAlbums() {
//   const { startIndex, endIndex } = getVisibleRange();

//   const visibleIndices = new Set();

//   for (let i = startIndex; i < endIndex; i++) {
//     visibleIndices.add(i);
//     if (!renderedIndices.has(i)) {
//       const album = filteredLibrary[i];

//       const albumElement = AlbumCard({
//         imageUrl: album?.img,
//         albumName: album?.album,
//         artistName: album?.artist,
//         link: album?.link,
//       });

//       // Position it absolutely
//       const row = Math.floor(i / columns);
//       const col = i % columns;

//       albumElement.style.position = "absolute";
//       albumElement.style.top = `${row * rowHeight}px`;
//       albumElement.style.left = `${col * itemWidth}px`;
//       albumElement.style.width = `${itemWidth}px`;
//       albumElement.style.height = `${rowHeight}px`;

//       // Optionally add dataset for easy tracking
//       albumElement.dataset.index = i;

//       grid.appendChild(albumElement);
//       renderedIndices.add(i);
    
//     }
//   }

//   // Remove out-of-view album elements
//   renderedIndices.forEach((i) => {
//     if (!visibleIndices.has(i)) {
//       const el = grid.querySelector(`[data-index='${i}']`);
//       if (el) {
//         grid.removeChild(el);
//       }
//       renderedIndices.delete(i);
//     }
//   });
// }

// let ticking = false;
// window.addEventListener("scroll", () => {
//   if (!ticking) {
//     requestAnimationFrame(() => {
//       renderVisibleAlbums();
//       ticking = false;
//     });
//     ticking = true;
//   }
// });

// let filteredLibrary = [];

// function filterAlbums(searchTerm) {
//   if (!searchTerm) {
//     filteredLibrary = library;
//     return;
//   }
//   const term = searchTerm.toLowerCase();
//   filteredLibrary = library.filter(album => {
//     const albumName = album.album.toLowerCase();
//     const artistName = album.artist.toLowerCase();
//     // Simple fuzzy match allowing for close matches
//     return albumName.includes(term) || artistName.includes(term) ||
//            albumName.includes(term.slice(0, -1)) || artistName.includes(term.slice(0, -1)) ||
//            (term.length > 1 && (albumName.includes(term.slice(1)) || artistName.includes(term.slice(1))));
//   });
// }

// document.getElementById("searchInput").addEventListener("input", debounce((e) => {
//   filterAlbums(e.target.value);
//   grid.innerHTML = '';
//   renderedIndices.clear();
//   totalAlbums = filteredLibrary.length;
//   calculateGridLayout();
//   renderVisibleAlbums();
  
//   // Toggle visibility of arrow_back icon based on input content
//   const arrowBack = document.querySelector(".arrow-back");
//   const searchInput = e.target;
//   console.log(searchInput);
//   if (e.target.value.length > 0) {
//     arrowBack.classList.remove("invisible", "-translate-x-2");
//     arrowBack.classList.add("visible", "translate-x-0");
//     searchInput.classList.remove("-translate-x-9");

//   } else {
//     arrowBack.classList.remove("visible", "translate-x-0");
//     arrowBack.classList.add("invisible", "-translate-x-2");
//     searchInput.classList.add("-translate-x-9");
//   }
// }, 200));

// // Add event listener to arrow-back to clear search input
// document.querySelector(".arrow-back").addEventListener("click", () => {
//   const searchInput = document.getElementById("searchInput");
//   searchInput.value = "";
//   filterAlbums("");
//   grid.innerHTML = '';
//   renderedIndices.clear();
//   totalAlbums = filteredLibrary.length;
//   calculateGridLayout();
//   renderVisibleAlbums();
  
//   // Hide arrow-back and adjust input position
//   const arrowBack = document.querySelector(".arrow-back");
//   arrowBack.classList.remove("visible", "translate-x-0");
//   arrowBack.classList.add("invisible", "-translate-x-2");
//   searchInput.classList.add("-translate-x-9");
// });

// // Initialize the application
// document.addEventListener("DOMContentLoaded", async () => {
//   fetchAlbums().then(() => {
//     filteredLibrary = library;
//     shuffleArray(library);
//     initGrid();
//   });
// });
