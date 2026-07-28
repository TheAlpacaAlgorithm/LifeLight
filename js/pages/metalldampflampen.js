import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-md',
  imageSrc: '../images/07_metalldampf.jpg',
  imageAlt: 'Metalldampflampen-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'natrium_spektrum.html', x: 24, y: 30, w: 5.5, h: 10 },
    { label: 'Nimm das Spektrum auf', href: 'quecksilber_spektrum.html', x: 72, y: 30, w: 6, h: 10 },
    { label: 'Hier geht es zur Auswertung', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
    { textcard: { content: '<h3>Metalldampflampen</h3><p>Metalldampflampen gehören zu den Gasentladungslampen. Eine Metalldampflampe ist ein Glaskolben, in dem sich das Metall und ein Edelgas zwischen zwei Elektroden befinden. Wird eine Spannung angelegt, entsteht zwischen den Elektroden ein elektrisches Feld. Das Edelgas dient dem Aufbau eines Funkens und das Metall verdampft. Die Elektronen bewegen sich von der einen Elektrode (Kathode) zur anderen (Anode). Auf diesem Weg werden die Elektronen beschleunigt. Durch die Beschleunigung können sie genug Energie aufnehmen, um die Metallatome durch Stöße zu ionisieren. Gehen die Metallatome wieder in den Grundzustand zurück, wird die Energie als Licht freigesetzt.</p>'
      },
      x: 1, y: 50, w: 98, h: 41
    },
  ],
});