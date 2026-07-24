import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-lsr',
  imageSrc: '../images/03_Leuchtstoffröhre.jpg',
  imageAlt: 'Leuchtstoffröhren-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'leuchtstoff_spektrum.html', x: 41, y: 1, w: 10, h: 35 },
    { label: 'Hier geht es zur Auswertung', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
    { textcard: { content: '<h3>Leuchtstoffröhren</h3><p>Das weiße, helle Licht dieser ausgedehnten Lampen wird oft in großen Räumen (z.B. Schulen, Büros) genutzt, da es eine gleichmäßige Ausleuchtung und eine förderliche Arbeitsatmosphäre ermöglicht.</p>'
      },
      x: 60, y: 5, w: 35, h: 30
    },
  ],
});