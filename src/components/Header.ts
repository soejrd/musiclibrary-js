export function Header(): HTMLElement {
  const header = document.createElement("header");
  const controlButtonClass =
    "px-2 py-2 text-zinc-500 dark:text-zinc-400 dark:hover:text-white hover:text-black flex cursor-pointer hover:bg-white/30 dark:hover:bg-zinc-950/30 rounded-sm duration-300 ease-out";

  header.className =
    "px-2 inset-x-0 top-8 h-[54px] flex items-center justify-between fixed z-1000 max-w-2xl mx-auto";
  header.dataset.state = "regular";
  header.innerHTML = `
      <div class="flex flex-row w-full h-full items-center justify-between dark:bg-zinc-900/80 bg-zinc-300/80 backdrop-blur-sm dark:shadow-md rounded-full border-1 dark:border-gray-100/10 border-gray-400/10 bg-zinc-100/10 transition-all duration-300 ease-out dark:hover:bg-zinc-800/80 dark:hover:border-gray-100/20">
        <button></button>
        <span
          class="material-symbols-rounded dark:hover:text-zinc-100 text-zinc-400 hover:text-zinc-950 transition-all duration-300 ease-out cursor-pointer ml-4 arrow-back transition-transform duration-300 ease-out invisible -translate-x-2"
          >close</span
        >
        <input
          type="text"
          placeholder="Zoek naar artiest/album..."
          id="searchInput"
          class="flex-1 w-full px-4 py-2 dark:text-gray-100 text-black dark:focus:text-white focus:outline-none -translate-x-9 transition-transform duration-300 ease-out block"
          data-state="visible"
        />
        <div class="settings flex flex-row md:invisible border-l-1 dark:border-zinc-800 border-zinc-400/30 mr-2 pl-2 h-full items-center justify-center">
          <button id="settingsBtn" class="${controlButtonClass}">
            <span class="material-symbols-rounded">tune</span>
          </button>
        </div>
        <div
          class="controls h-full hidden md:flex flex-row items-center absolute left-0 md:relative md:justify-center md:border-l-1 border-l-0 dark:border-zinc-800 border-zinc-400/30 mr-2 pl-2 translate-x-4 md:translate-x-0 transition-all duration-300 ease-out opacity-0 md:opacity-100 will-change-transform,opacity"
          id="controlsContainer"
          data-state="hidden"
        >
          <button id="shuffleBtn" class="${controlButtonClass} controls--shuffle">
            <span class="material-symbols-rounded">shuffle</span>
          </button>
          <button id="zoomOutBtn" class="${controlButtonClass}">
            <span class="material-symbols-rounded">zoom_out</span>
          </button>
          <button id="zoomInBtn" class="${controlButtonClass}">
            <span class="material-symbols-rounded">zoom_in</span>
          </button>
          <button id="viewToggleBtn" class="${controlButtonClass}">
            <span class="material-symbols-rounded">view_carousel</span>
          </button>
          <button id="themeBtn" class="${controlButtonClass}">
            <span class="material-symbols-rounded">light_mode</span>
          </button>
        </div>
      </div>
    `;

  // Add toggle functionality for mobile view
  const settingsBtn = header.querySelector('#settingsBtn') as HTMLElement;
  const searchInput = header.querySelector('#searchInput') as HTMLInputElement;
  const controlsContainer = header.querySelector('#controlsContainer') as HTMLElement;
  let hideTimeout: number | undefined;

  settingsBtn?.addEventListener('click', () => {
    clearTimeout(hideTimeout);

    if (header.dataset.state === 'regular') {
      // Switch to settings state
      header.dataset.state = 'settings';
      searchInput?.classList.add('hidden');
      controlsContainer?.classList.remove('hidden');
      controlsContainer?.classList.add('flex', 'opacity-0', 'translate-x-4');
      // Force reflow before animation
      if (controlsContainer) void controlsContainer.offsetWidth;
      controlsContainer?.classList.remove('translate-x-4', 'opacity-0');
      controlsContainer?.setAttribute('data-state', 'visible');
    } else {
      // Switch back to regular state
      header.dataset.state = 'regular';
      searchInput?.classList.remove('hidden');
      // Animate out
      controlsContainer?.classList.add('translate-x-4', 'opacity-0');
      hideTimeout = window.setTimeout(() => {
        controlsContainer?.classList.add('hidden');
        controlsContainer?.classList.remove('flex');
      }, 300); // Match duration of transition
      controlsContainer?.setAttribute('data-state', 'hidden');
    }
  });

  return header;
}
