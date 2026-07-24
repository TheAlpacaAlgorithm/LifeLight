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
    let element;

    if (hotspot.textcard) {
      // Text-Card Hotspot
      element = document.createElement('div');
      element.className = 'text-card';
      element.innerHTML = hotspot.textcard.content || '<p>' + hotspot.label + '</p>';
      element.style.position = 'absolute';
      element.style.zIndex = '5';
      element.style.left = '0px';
      element.style.top = '0px';
    } else {
      // Normaler Hotspot (visible oder invisible)
      element = document.createElement('a');
      element.className = 'hotspot';
      element.href = hotspot.href;
      element.setAttribute('aria-label', hotspot.label);
      element.title = hotspot.label;
      element.style.left = '0px';
      element.style.top = '0px';
      element.style.width = '0px';
      element.style.height = '0px';

      if (hotspot.visible) {
        element.classList.add('visible');
        element.textContent = hotspot.label;
        element.setAttribute('role', 'button');
      } else {
        element.dataset.label = hotspot.label;
      }
    }

    hotspotLayer.appendChild(element);
    return { ...hotspot, element };
  });

  // --- Layout-Logik (identisch für beide Typen) ---
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

      if (hotspot.textcard) {
        hotspot.element.style.maxWidth = `${width}px`;
        hotspot.element.style.maxHeight = '40vh';
      } else {
        hotspot.element.style.width = `${width}px`;
        hotspot.element.style.height = `${height}px`;
      }
    });
  }

  // --- Init & Events ---
  if (image.complete) {
    layoutHotspots();
  } else {
    image.addEventListener('load', layoutHotspots, { once: true });
  }

  window.addEventListener('resize', layoutHotspots);

  return {
    refresh: layoutHotspots,
    destroy() {
      window.removeEventListener('resize', layoutHotspots);
      mount.replaceChildren();
    },
  };
}