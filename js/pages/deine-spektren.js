import { getSelectedSpectrum, isSpectrumCollected, setSelectedSpectrum } from '../spectrum-progress.js';

if (window.Chart && window.ChartZoom) {
  Chart.register(ChartZoom);
} else {
  console.warn('chartjs-plugin-zoom not found');
}

const SPECTRUM_MIN_WAVELENGTH = 300;
const SPECTRUM_MAX_WAVELENGTH = 800;
const SPECTRUM_STEP = 1;
const VISIBLE_MIN_WAVELENGTH = 380;
const VISIBLE_MAX_WAVELENGTH = 780;

let spectrumChart = null;
const selectedSpectra = new Set();
const spectrumOptions = [
  {
    id: 'sonnenlicht',
    label: 'Sonnenlicht',
    csv: '../../src/data/sun_2.csv',
    color: '#FFD700'  // Gold - volle Sonne
  },
  {
    id: 'leuchtstoff',
    label: 'Leuchtstoffröhre',
    csv: '../../src/data/leuchtstoff.csv',
    color: '#ffffff'  // Kühlweiß/Cyan
  },
  {
    id: 'gluehlampe',
    label: 'Glühlampe',
    csv: '../../src/data/glueh.csv',
    color: '#ffb96f'  // Warmes Orange
  },
  {
    id: 'led-warm',
    label: 'LED-Lampe (warmweiß)',
    csv: '../../src/data/led_warm.csv',
    color: '#ff4500'  // Weicheres Orange als Glühlampe
  },
  {
    id: 'led-kalt',
    label: 'LED-Lampe (kaltweiß)',
    csv: '../../src/data/led_cold.csv',
    color: '#76deff'  // Kühlweiß mit leichtem Blaustich
  },
  {
    id: 'helium',
    label: 'Heliumlampe',
    csv: '../../src/data/helium.csv',
    color: '#FF9ECC'  // Rosa/Pink - typische Helium-Gasentladung
  },
  {
    id: 'wasserstoff',
    label: 'Wasserstofflampe',
    csv: '../../src/data/hydrogen.csv',
    color: '#ed48f8'  // Violett/Rosa - Balmer-Serie (H-alpha rot, H-beta blau/grün)
  },
  {
    id: 'neon',
    label: 'Neonlampe',
    csv: '../../src/data/neon.csv',
    color: '#FF6B35'  // Klassisches Rot-Orange
  },
  {
    id: 'natrium',
    label: 'Natriumdampflampe',
    csv: '../../src/data/sodium.csv',
    color: '#ffa600'  // Intensiv gelb (589 nm Doppel Linie)
  },
  {
    id: 'uv',
    label: 'UV-Lampe',
    csv: '../../src/data/uv_lamp.csv',
    color: '#5c00ff'  // Violett/Lila - UV ist unsichtbar, dies zeigt die nahbare UV-Violettkante
  },
];

function renderSpectrumOption(option) {
  const collected = isSpectrumCollected(option.id);
  const selected = getSelectedSpectrum() === option.id;
  const locked = option.id ? !collected : false;

  return `
    <button
      type="button"
      class="spectrum-choice ${locked ? 'spectrum-choice--locked' : ''} ${selected ? 'spectrum-choice--selected' : ''}"
      data-spectrum-id="${option.id}"
      ${locked ? 'disabled aria-disabled="true"' : ''}
    >
      <span class="spectrum-choice__label">${option.label}</span>
      ${locked ? '<span class="spectrum-choice__lock">noch nicht gesammelt</span>' : ''}
    </button>
  `;
}

function syncSpectrumChoiceStyles() {
  document.querySelectorAll('.spectrum-choice').forEach((button) => {
    const spectrumId = button.getAttribute('data-spectrum-id');
    const locked = spectrumId ? !isSpectrumCollected(spectrumId) : false;
    const selected = selectedSpectra.has(spectrumId);
    button.classList.toggle('spectrum-choice--locked', locked);
    button.classList.toggle('spectrum-choice--selected', selected);
    button.disabled = locked;
    button.setAttribute('aria-disabled', locked ? 'true' : 'false');
  });
}

function buildSpectrumOptionsUI() {
  const container = document.querySelector('.controls.temperature-control');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'spectrum-choice-panel';
  wrapper.innerHTML = `
    <div class="spectrum-choice-panel__header">
      <h2 class="spectrum-choice-panel__title">Spektrenauswahl</h2>
      <label class="spectrum-choice-panel__select-all">
        <input type="checkbox" id="select-all-spectra" class="spectrum-choice-panel__checkbox">
        <span>LifeLight-Spektrum zeigen</span>
      </label>
    </div>
    <div class="spectrum-choice-panel__grid">
      ${spectrumOptions.map(renderSpectrumOption).join('')}
    </div>
  `

  container.insertAdjacentElement('afterend', wrapper);

  wrapper.addEventListener('click', (event) => {
    const button = event.target.closest('.spectrum-choice');
    if (!button || button.disabled) return;

    const spectrumId = button.getAttribute('data-spectrum-id');
    selectedSpectra.has(spectrumId)
        ? selectedSpectra.delete(spectrumId)
        : selectedSpectra.add(spectrumId);
    syncSpectrumChoiceStyles();
    renderSelectedSpectra();
  });

  syncSpectrumChoiceStyles();
}

function initializeSpectrumOptions() {
  if (document.querySelector('.spectrum-choice-panel')) {
    syncSpectrumChoiceStyles();
    return;
  }

  buildSpectrumOptionsUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSpectrumOptions, { once: true });
} else {
  initializeSpectrumOptions();
}

// CSV-Parser: Lädt Wellenlänge und Intensität aus CSV (keine Header, Komma-getrennt)
async function parseCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    const lines = text.trim().split('\n');
    const data = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',');
      if (parts.length < 2) continue;

      const wavelength = parseFloat(parts[0]);
      const intensity = parseFloat(parts[1]);

      if (!isNaN(wavelength) && !isNaN(intensity)) {
        data.push({ x: wavelength, y: intensity });
      }
    }

    data.sort((a, b) => a.x - b.x);
    return data;
  } catch (error) {
    console.error(`Fehler beim Laden von ${url}:`, error);
    return [];
  }
}

// Farbe aus Wellenlänge berechnen (für visuellen Hintergrund)
function wavelengthToRGB(wavelength) {
  let R = 0, G = 0, B = 0, alpha = 1;

  if (wavelength >= 380 && wavelength < 440) {
    const attenuation = 0.1 + 0.7 * (wavelength - 380) / (440 - 380);
    R = (-(wavelength - 440) / (440 - 380)) * attenuation;
    G = 0;
    B = attenuation;
  } else if (wavelength >= 440 && wavelength < 490) {
    R = 0;
    G = (wavelength - 440) / (490 - 440);
    B = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    R = 0;
    G = 1;
    B = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    R = (wavelength - 510) / (580 - 510);
    G = 1;
    B = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    R = 1;
    G = -(wavelength - 645) / (645 - 580);
    B = 0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    R = 0.3 + 0.7 * (750 - wavelength) / (750 - 645);
    G = 0;
    B = 0;
  } else {
    alpha = 0;
  }

  const gamma = 0.8;
  R = Math.pow(R * alpha, gamma);
  G = Math.pow(G * alpha, gamma);
  B = Math.pow(B * alpha, gamma);

  return {
    r: Math.round(R * 255),
    g: Math.round(G * 255),
    b: Math.round(B * 255)
  };
}

// Neue Funktion: Lädt alle ausgewählten Spektren aus CSV und rendert im Chart
async function renderSelectedSpectra() {
  const chartCanvas = document.getElementById('spectrumChart');
  if (!chartCanvas) return;

  const activeIds = Array.from(selectedSpectra);

  if (activeIds.length === 0) {
    if (spectrumChart) {
      spectrumChart.data.datasets = [];
      spectrumChart.update();
    }
    return;
  }

  const datasets = [];
  const promises = activeIds.map(async (id) => {
    const option = spectrumOptions.find(o => o.id === id);
    if (!option) return null;

    const dataPoints = await parseCSV(option.csv);
    if (dataPoints.length === 0) return null;

    // 🔧 NORMALISIERUNG
    const intensities = dataPoints.map(p => p.y);
    const maxIntensity = Math.max(...intensities);

    // 🔧 XY-OBJEKTE statt separat labels + data
    const normalizedData = dataPoints.map(p => ({
      x: p.x,
      y: maxIntensity > 0 ? p.y / maxIntensity : 0
    }));

    return {
      label: option.label,
      data: normalizedData,  // [{x: 351.9, y: 0.3}, {x: 352.1, y: 0.4}, ...]
      borderColor: option.color,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0.1
    };
  });

  const results = await Promise.all(promises);
  const validDatasets = results.filter(d => d !== null);

  const ctx = chartCanvas.getContext('2d');

  if (spectrumChart) {
    spectrumChart.data.datasets = validDatasets;
    spectrumChart.update();
  } else {
    spectrumChart = new Chart(ctx, {
      type: 'line',
      data: { datasets: validDatasets },  // KEINE labels mehr!
      options: {
        animation: false,
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: 'white' }
          },
          zoom: {
            zoom: {
              drag: { enabled: true, backgroundColor: 'rgba(255,255,255,0.08)' },
              pinch: { enabled: true },
              mode: 'xy'
            },
            pan: { enabled: false, mode: 'x' }
          }
        },
        scales: {
          x: {
            type: 'linear',  // Wichtig: linear, NICHT category!
            grid: { color: 'rgba(255,255,255,0.2)' },
            ticks: { color: 'white', font: { size: 14 } },
            title: {
              display: true,
              text: 'Wellenlänge (nm)',
              color: 'white',
              font: { size: 18 }
            },
            min: 300,
            max: 800
          },
          y: {
            type: 'linear',
            grid: { color: 'rgba(255,255,255,0.2)' },
            ticks: { color: 'white', font: { size: 14 } },
            title: {
              display: true,
              text: 'Relative Intensität',
              color: 'white',
              font: { size: 18 }
            },
            min: 0,
            max: 1
          }
        }
      },
      plugins: [visibleRangeBackground]
    });
  }
}

// Plugin: Sichtbarer Bereich Hintergrund (visuell unverändert)
const visibleRangeBackground = {
  id: 'visibleRangeBackground',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales.x) return;

    const left = scales.x.getPixelForValue(VISIBLE_MIN_WAVELENGTH);
    const right = scales.x.getPixelForValue(VISIBLE_MAX_WAVELENGTH);
    const top = chartArea.top;
    const height = chartArea.bottom - chartArea.top;

    if (right <= left) return;

    const gradient = ctx.createLinearGradient(left, 0, right, 0);
    const stops = 100;

    for (let i = 0; i <= stops; i++) {
      const wl = VISIBLE_MIN_WAVELENGTH + (i / stops) * (VISIBLE_MAX_WAVELENGTH - VISIBLE_MIN_WAVELENGTH);
      const color = wavelengthToRGB(wl);
      const intensity = 0.3;
      const r = Math.min(255, Math.round(color.r * intensity));
      const g = Math.min(255, Math.round(color.g * intensity));
      const b = Math.min(255, Math.round(color.b * intensity));
      gradient.addColorStop(i / stops, `rgb(${r},${g},${b})`);
    }

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(left, top, right - left, height);
    ctx.restore();
  }
};

// Initialrendering: Bei Seitenstart leeren Chart oder geladene Spektren anzeigen
setTimeout(() => {
  renderSelectedSpectra();
}, 100);

document.getElementById('resetZoomBtn')?.addEventListener('click', () => {
  if (spectrumChart && spectrumChart.resetZoom) {
    spectrumChart.resetZoom();
  }
});