import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app',
  imageSrc: 'images/01_Laborübersicht.jpg',
  imageAlt: 'Laborübersicht mit markierten Bereichen',
  hotspots: [
    { label: 'Metalldampflampen',     href: 'subsites/metalldampflampen.html',   x: 9,  y: 65, w: 12, h: 30 },
    { label: 'Sonnenlicht',           href: 'subsites/sonnenlicht.html',         x: 7,  y: 30, w: 27, h: 23 },
    { label: 'Leuchtstoffröhren',      href: 'subsites/leuchtstoffroehren.html',   x: 10, y: 9,  w: 70, h: 10 },
    { label: 'Gasentladungsröhren',   href: 'subsites/gasentladungsroehren.html', x: 38, y: 55, w: 25, h: 7  },
    { label: 'Weitere Lampen',        href: 'subsites/weitere-lampen.html',       x: 74, y: 43, w: 9,  h: 15 },
    { label: 'Zur Analyse gesammelter Spektren', href: 'subsites/deine-spektren.html', visible: true, x: 45, y: 90, w: 25, h: 5 },
  ],
});