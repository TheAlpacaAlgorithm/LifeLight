import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-lsr',
  imageSrc: '../images/03_Leuchtstoffröhre.jpg',
  imageAlt: 'Leuchtstoffröhren-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'leuchtstoff_spektrum.html', x: 2, y: 15, w: 10, h: 15 },
    { label: 'Hier geht es zur Auswertung', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
  ],
});