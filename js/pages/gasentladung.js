import { createHotspotView } from '../hotspot-view.js';

createHotspotView({
  mountSelector: '#app-ge',
  imageSrc: '../images/05_gasentladung.png',
  imageAlt: 'Gasentladungsröhren-Laborbereich',
  hotspots: [
    { label: 'Nimm das Spektrum auf', href: 'wasserstoff_spektrum.html', x: 11.2, y: 24, w: 30, h: 5 },
    { label: 'Nimm das Spektrum auf', href: 'helium_spektrum.html', x: 62, y: 25.5, w: 30, h: 5 },
    { label: 'Nimm das Spektrum auf', href: 'neon_spektrum.html', x: 13, y: 75, w: 22, h: 5 },
    { label: 'Nimm das Spektrum auf', href: 'argon_spektrum.html', x: 62, y: 73, w: 30, h: 5 },
    { label: 'Zur Analyse gesammelter Spektren', href: 'deine-spektren.html', visible: true, x: 70, y: 90, w: 25, h: 5 },
    { label: 'Zurück zum Lichtlabor', href: '../index.html', visible: true, x: 5, y: 90, w: 25, h: 5 },
    { textcard: { content: '<h3>Gasentladungsröhren</h3><p>Durch das elektrische Feld zwischen der negativ geladenen Kathode und der positiv geladenen Anode werden die Gasatome angeregt. ' +
            'Da diese Zustände instabil sind, kehren die Atome wieder in den Grundzustand zurück. ' +
            'Dabei emittieren die Atome Energie in Form von Licht. Dieser Vorgang wird Lumineszenz genannt. ' +
            'Die Farbe bzw. Frequenz des ausgesendeten Lichts entspricht über E= hf den spezifischen Energieübergängen des Gases.</p>'},
      x: 1, y: 35, w: 98, h: 32
    },
  ],
});