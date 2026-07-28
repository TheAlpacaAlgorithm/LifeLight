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
    { label: 'Hier geht es zur Auswertung', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
    { textcard: { content: '<h3>LEDs</h3><p>LED-Lampen funktionieren ähnlich wie Leuchtstoffröhren. Eine LED (Light Emitting Diode) sendet kurzwelliges blaues Licht aus, das dann einen Leuchtstoff anregt, der ein breiteres Spektrum von Licht abstrahlt. Durch unterschiedliche Leuchtstoffe kann die Lichtfarbe variiert werden. LED-Lampen sind energiesparend, weil keine Strahlung im nicht sichtbaren Bereich erzeugt wird.</p>'
      },
      x: 1, y: 40, w: 38.6, h: 50
    },
    { textcard: { content: '<h3>UV-Lampe</h3><p>Das ist eine spezielle Leuchtstoffröhre, die kurzwellige UV-Strahlung und nur in geringem Maße sichtbares Licht abgibt. Diese Lampen werden im medizinischen Bereich zur Erkennung von Hautkrankeiten verwendet. Man kann sie auch zum Nachweis von Blut und Sperma einsetzen.</p>'
      },
      x: 41.2, y: 42.5, w: 27, h: 55
    },
    { textcard: { content: '<h3>Glühlampe</h3><p>In einer Glühlampe wird ein Glühfaden durch Strom aufgeheizt gibt so Wärmestrahlung ab. Der Glühfaden befindet sich in einer luftleeren Glashülle, um Oxidation und die Zerstörung des Drahts zu verhindern.</p>'
      },
      x: 69.2, y: 50, w: 29.9, h: 39.7
    },
  ],
});