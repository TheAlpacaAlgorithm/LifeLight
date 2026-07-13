import { getSelectedSpectrum, isSpectrumCollected, setSelectedSpectrum } from './spectrum-progress.js';

if (window.Chart && window.ChartZoom) {
  Chart.register(ChartZoom);
} else {
  console.warn('chartjs-plugin-zoom not found');
}

const SPECTRUM_MIN_WAVELENGTH = 100;
const SPECTRUM_MAX_WAVELENGTH = 1500;
const SPECTRUM_STEP = 1;
const VISIBLE_MIN_WAVELENGTH = 380;
const VISIBLE_MAX_WAVELENGTH = 780;
const PLANCK_H = 6.62607015e-34;
const PLANCK_C = 299792458;
const PLANCK_K = 1.380649e-23;

let spectrumChart = null;
const spectrumOptions = [
  {
    id: 'sonnenlicht',
    label: 'Sonnenlicht',
    description: '',
  },
  {
    id: 'placeholder-1',
    label: 'Weitere Spektren',
    description: '',
  },
];

function renderSpectrumOption(option) {
  const collected = isSpectrumCollected(option.id);
  const selected = getSelectedSpectrum() === option.id;
  const locked = option.id === 'sonnenlicht' ? !collected : false;

  return `
    <button
      type="button"
      class="spectrum-choice ${locked ? 'spectrum-choice--locked' : ''} ${selected ? 'spectrum-choice--selected' : ''}"
      data-spectrum-id="${option.id}"
      ${locked ? 'disabled aria-disabled="true"' : ''}
    >
      <span class="spectrum-choice__label">${option.label}</span>
      <span class="spectrum-choice__description">${option.description}</span>
      ${locked ? '<span class="spectrum-choice__lock">noch nicht gesammelt</span>' : '<span class="spectrum-choice__lock">auswählen</span>'}
    </button>
  `;
}

function syncSpectrumChoiceStyles() {
  document.querySelectorAll('.spectrum-choice').forEach((button) => {
    const spectrumId = button.getAttribute('data-spectrum-id');
    const locked = spectrumId === 'sonnenlicht' ? !isSpectrumCollected('sonnenlicht') : false;
    const selected = getSelectedSpectrum() === spectrumId;
    button.classList.toggle('spectrum-choice--locked', locked);
    button.classList.toggle('spectrum-choice--selected', selected);
    button.disabled = locked;
    button.setAttribute('aria-disabled', locked ? 'true' : 'false');
    const lockLabel = button.querySelector('.spectrum-choice__lock');
    if (lockLabel) {
      lockLabel.textContent = locked ? 'noch nicht gesammelt' : 'auswählen';
    }
  });
}

function buildSpectrumOptionsUI() {
  const container = document.querySelector('.controls.temperature-control');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'spectrum-choice-panel';
  wrapper.innerHTML = `
    <div class="spectrum-choice-panel__title">Spektrenauswahl</div>
    <div class="spectrum-choice-panel__grid">
      ${spectrumOptions.map(renderSpectrumOption).join('')}
    </div>
  `;

  container.insertAdjacentElement('afterend', wrapper);

  wrapper.addEventListener('click', (event) => {
    const button = event.target.closest('.spectrum-choice');
    if (!button || button.disabled) return;

    const spectrumId = button.getAttribute('data-spectrum-id');
    setSelectedSpectrum(spectrumId);
    syncSpectrumChoiceStyles();
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

function planckRadiance(wavelengthNm, temperatureK) {
  const lambda = wavelengthNm * 1e-9;
  if (!(lambda > 0) || !(temperatureK > 0)) return 0;

  const exponent = (PLANCK_H * PLANCK_C) / (lambda * PLANCK_K * temperatureK);
  if (!Number.isFinite(exponent) || exponent > 700) return 0;

  const numerator = 2 * PLANCK_H * PLANCK_C * PLANCK_C;
  const denominator = Math.pow(lambda, 5) * Math.expm1(exponent);
  if (!Number.isFinite(denominator) || denominator <= 0) return 0;

  return numerator / denominator;
}

function generateBlackbodySpectrum(temperatureK) {
  const wavelengths = [];
  const intensities = [];

  for (let wl = SPECTRUM_MIN_WAVELENGTH; wl <= SPECTRUM_MAX_WAVELENGTH; wl += SPECTRUM_STEP) {
    wavelengths.push(wl);
    intensities.push(planckRadiance(wl, temperatureK));
  }

  const maxIntensity = Math.max(...intensities);
  const normIntensities = maxIntensity > 0
    ? intensities.map(i => i / maxIntensity)
    : intensities.map(() => 0);

  return { wavelengths, intensities, normIntensities };
}

function drawStarColor(r, g, b) {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 50;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
  gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.6)`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},1)`;
  ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
  ctx.shadowBlur = 20;
  ctx.fill();
}

function weightedAverageColor(wavelengths, intensities) {
  let sumR = 0, sumG = 0, sumB = 0, sumInt = 0, count = 0;
  const brightnessCheckbox = document.getElementById('maxBrightnessCheckbox');
  const ischecked = brightnessCheckbox ? brightnessCheckbox.checked : false;
  for (let i = 0; i < wavelengths.length; i++) {
    const wl = wavelengths[i];
    if (wl >= VISIBLE_MIN_WAVELENGTH && wl <= VISIBLE_MAX_WAVELENGTH) {
      const intensity = intensities[i];
      const color = wavelengthToRGB(wl);
      sumR += color.r * intensity;
      sumG += color.g * intensity;
      sumB += color.b * intensity;
      sumInt += intensity;
      count += 1;
    }
  }
  const totalIntensity = Math.max(sumR, sumG, sumB);
  if (totalIntensity <= 0) return { r: 0, g: 0, b: 0 };
  if (!ischecked) {
    return {
      r: Math.round((sumR / totalIntensity) * 255 * sumInt / count),
      g: Math.round((sumG / totalIntensity) * 255 * sumInt / count),
      b: Math.round((sumB / totalIntensity) * 255 * sumInt / count),
    };
  }
  else {
    return {
      r: Math.round((sumR / totalIntensity) * 255),
      g: Math.round((sumG / totalIntensity) * 255),
      b: Math.round((sumB / totalIntensity) * 255),
    };
  }
}

function updateTemperatureLabel(temperatureC) {
  const label = document.getElementById('temperatureValue');
  if (label) label.textContent = `${temperatureC} °C`;
}

function renderBlackbodySpectrum(temperatureC) {
  const temperatureK = temperatureC + 273.15;
  const chartCanvas = document.getElementById('spectrumChart');
  if (!chartCanvas) return;

  const { wavelengths, intensities, normIntensities } = generateBlackbodySpectrum(temperatureK);

  const visibleRangeBackground = {
    id: 'visibleRangeBackground',
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x) return;

      const left = scales.x.getPixelForValue(VISIBLE_MIN_WAVELENGTH);
      const right = scales.x.getPixelForValue(VISIBLE_MAX_WAVELENGTH);
      const top = chartArea.top;
      const height = chartArea.bottom - chartArea.top;
      const gradient = ctx.createLinearGradient(left, 0, right, 0);

      const stops = 200;
      let maxint = 0;
      for (let i = 0; i <= stops; i++) {
        const wl = VISIBLE_MIN_WAVELENGTH + (i / stops) * (VISIBLE_MAX_WAVELENGTH - VISIBLE_MIN_WAVELENGTH);
        const idx = Math.max(0, Math.min(wavelengths.length - 1, Math.round((wl - SPECTRUM_MIN_WAVELENGTH) / SPECTRUM_STEP)));
        if (normIntensities[idx] > maxint) maxint = normIntensities[idx];
      }

      for (let i = 0; i <= stops; i++) {
        const wl = VISIBLE_MIN_WAVELENGTH + (i / stops) * (VISIBLE_MAX_WAVELENGTH - VISIBLE_MIN_WAVELENGTH);
        const idx = Math.max(0, Math.min(wavelengths.length - 1, Math.round((wl - SPECTRUM_MIN_WAVELENGTH) / SPECTRUM_STEP)));
        const intensity = maxint > 0 ? normIntensities[idx] / maxint : 0;
        const color = wavelengthToRGB(wl);

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

  const drawStarPlugin = {
    id: 'drawStar',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const starCanvas = document.getElementById('starCanvas');
      if (!starCanvas || !chartArea) return;

      const size = 100;
      const x = chartArea.right - size - 1;
      const y = chartArea.top + 1;
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, size, size);
      ctx.restore();
      ctx.save();
      ctx.drawImage(starCanvas, x, y, size, size);
      ctx.restore();
    }
  };

  const ctx = chartCanvas.getContext('2d');
  if (spectrumChart) spectrumChart.destroy();

  const avgColor = weightedAverageColor(wavelengths, normIntensities);
  drawStarColor(avgColor.r, avgColor.g, avgColor.b);

  spectrumChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: wavelengths,
      datasets: [{
        label: 'Spektrum der Wärmestrahlung',
        data: normIntensities,
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: 2,
        pointRadius: 0,
      }]
    },
    options: {
      animation: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        zoom: {
          zoom: {
            drag: {
              enabled: true,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
            pinch: { enabled: true },
            mode: 'xy'
          },
          pan: {
            enabled: false,
            mode: 'x'
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.2)' },
          type: 'linear',
          ticks: {
            color: 'white',
            font: { size: 14 }
          },
          title: {
            display: true,
            text: 'Wellenlänge (nm)',
            color: 'white',
            font: { size: 18 }
          },
          min: SPECTRUM_MIN_WAVELENGTH,
          max: SPECTRUM_MAX_WAVELENGTH
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.2)' },
          type: 'linear',
          ticks: {
            color: 'white',
            font: { size: 14 }
          },
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
    plugins: [visibleRangeBackground, drawStarPlugin]
  });
}

const temperatureSlider = document.getElementById('temperatureSlider');
const initialTemperature = Number(temperatureSlider?.value || 5800);
updateTemperatureLabel(initialTemperature);
renderBlackbodySpectrum(initialTemperature);

const brightnessCheckbox = document.getElementById('maxBrightnessCheckbox');
brightnessCheckbox?.addEventListener('change', () => {
  const temperatureC = Number(temperatureSlider.value);
  renderBlackbodySpectrum(temperatureC);
});

temperatureSlider?.addEventListener('input', () => {
  const temperatureC = Number(temperatureSlider.value);
  updateTemperatureLabel(temperatureC);
  renderBlackbodySpectrum(temperatureC);
});

document.getElementById('resetZoomBtn')?.addEventListener('click', () => {
  if (spectrumChart && spectrumChart.resetZoom) {
    spectrumChart.resetZoom();
  }
});
