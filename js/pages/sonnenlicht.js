import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-sun',
  imageSrc: '../images/02_Sonnenlicht.jpg',
  imageAlt: 'Sonnenlicht-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'sonnenlicht_spektrum.html', x: 2, y: 15, w: 10, h: 15 },
    { label: 'Zur Analyse gesammelter Spektren', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
      { textcard: { content: '<h3>Sonnenlicht</h3>\n' +
              '    <p>Die Sonne ist für uns die wichtigste Lichtquelle und für das Leben auf der Erde unerlässlich.\n' +
              '      Das Sonnenlicht stammt vor allem von der weiter außen liegenden Photosphäre der Sonne.</p>'
      },
      x: 50, y: 3, w: 45, h: 30
    },
  ],
});