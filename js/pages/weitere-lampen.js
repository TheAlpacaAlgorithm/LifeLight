import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-wl',
  imageSrc: '../images/04_weitere.jpg',
  imageAlt: 'Weitere Lampen-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'LED_A_spektrum.html', x: 5, y: 15, w: 10, h: 20 },
    { label: 'Nimm das Spektrum auf', href: 'LED_B_spektrum.html', x: 26, y: 18, w: 10, h: 20 },
    { label: 'Nimm das Spektrum auf', href: 'UV_spektrum.html', x: 50.5, y: 15, w: 7, h: 20 },
    { label: 'Nimm das Spektrum auf', href: 'glueh_spektrum.html', x: 79, y: 17, w: 10, h: 20 },
    { label: 'Zur Analyse gesammelter Spektren', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
  ],
});