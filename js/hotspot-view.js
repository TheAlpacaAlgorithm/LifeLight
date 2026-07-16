/**
 * Erstellt eine interaktive Hotspot-Ansicht auf einem Bild.
 *
 * @param {Object} config
 * @param {string} config.mountSelector  – CSS-Selektor des Mount-Punkts (z. B. '#app')
 * @param {string} config.imageSrc        – Pfad zum Hintergrundbild
 * @param {string} config.imageAlt         – Alt-Text für das Bild
 * @param {Array}  config.hotspots         – Array von Hotspot-Definitionen
 */
export function createHotspotView(config) {
  const {
    mountSelector,
    imageSrc,
    imageAlt = 'Laborübersicht mit markierten Bereichen',
    hotspots = [],
  } = config;

  const mount = document.querySelector(mountSelector);
  if (!mount) {
    console.warn(`HotspotView: Mount-Element "${mountSelector}" nicht gefunden.`);
    return;
  }

  // --- DOM aufbauen ---
  const shell = document.createElement('section');
  shell.className = 'app-shell';

  const image = document.createElement('img');
  image.className = 'app-shell__image';
  image.src = imageSrc;
  image.alt = imageAlt;
  image.draggable = false;

  const hotspotLayer = document.createElement('div');
  hotspotLayer.className = 'hotspot-layer';

  shell.append(image, hotspotLayer);
  mount.replaceChildren(shell);

  // --- Hotspot-Elemente erzeugen ---
  const hotspotElements = hotspots.map((hotspot) => {
    const link = document.createElement('a');
    link.className = 'hotspot';
    link.href = hotspot.href;
    link.setAttribute('aria-label', hotspot.label);
    link.title = hotspot.label;
    link.style.left = '0px';
    link.style.top = '0px';
    link.style.width = '0px';
    link.style.height = '0px';

    if (hotspot.visible) {
      link.classList.add('visible');
      link.textContent = hotspot.label;
      link.setAttribute('role', 'button');
      // data-label leeren lassen, damit kein Tooltip erscheint
    } else {
      link.dataset.label = hotspot.label;
    }

    hotspotLayer.appendChild(link);
    return { ...hotspot, element: link };
  });

  // --- Layout-Logik ---
  function fitContain(naturalWidth, naturalHeight, containerWidth, containerHeight) {
    const scale = Math.min(
      containerWidth / naturalWidth,
      containerHeight / naturalHeight
    );
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    return {
      scale,
      width,
      height,
      offsetX: (containerWidth - width) / 2,
      offsetY: (containerHeight - height) / 2,
    };
  }

  function layoutHotspots() {
    const naturalWidth = image.naturalWidth || 1920;
    const naturalHeight = image.naturalHeight || 1080;
    const { width: containerWidth, height: containerHeight } =
      shell.getBoundingClientRect();

    if (!containerWidth || !containerHeight) return;

    const fitted = fitContain(
      naturalWidth,
      naturalHeight,
      containerWidth,
      containerHeight
    );

    hotspotElements.forEach((hotspot) => {
      const left = fitted.offsetX + (hotspot.x / 100) * fitted.width;
      const top = fitted.offsetY + (hotspot.y / 100) * fitted.height;
      const width = (hotspot.w / 100) * fitted.width;
      const height = (hotspot.h / 100) * fitted.height;

      hotspot.element.style.left = `${left}px`;
      hotspot.element.style.top = `${top}px`;
      hotspot.element.style.width = `${width}px`;
      hotspot.element.style.height = `${height}px`;
    });
  }

  // --- Init & Events ---
  if (image.complete) {
    layoutHotspots();
  } else {
    image.addEventListener('load', layoutHotspots, { once: true });
  }

  window.addEventListener('resize', layoutHotspots);

  // Öffentliche API zurückgeben (für spätere Erweiterung)
  return {
    refresh: layoutHotspots,
    destroy() {
      window.removeEventListener('resize', layoutHotspots);
      mount.replaceChildren();
    },
  };
}