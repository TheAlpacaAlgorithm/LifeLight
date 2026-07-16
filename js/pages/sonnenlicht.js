import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-sun',
  imageSrc: '../images/02_Sonnenlicht.jpg',
  imageAlt: 'Sonnenlicht-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'sonnenlicht_spektrum.html', x: 2, y: 15, w: 10, h: 15 },
    { label: 'Hier geht es zur Auswertung', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
  ],
});