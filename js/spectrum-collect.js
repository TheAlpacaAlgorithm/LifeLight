// js/pages/spektrum-collect.js
import { isSpectrumCollected, markSpectrumCollected } from './spectrum-progress.js';

export function setupSpectrumCollection(spectrumId) {
  if (typeof spectrumId !== 'string' || !spectrumId.trim()) {
    throw new TypeError('setupSpectrumCollection benötigt eine gültige spectrumId');
  }

  const pageRoot = document.body.firstElementChild;
  if (!pageRoot) {
    console.warn('setupSpectrumCollection: Seitencontainer nicht gefunden.');
    return;
  }

  const collected = isSpectrumCollected(spectrumId);

  const collectBar = document.createElement('div');
  collectBar.className = 'collect-spectrum-bar';
  collectBar.innerHTML = `
    <button id="collectSpectrumBtn" class="button collect-spectrum-button"
            type="button" ${collected ? 'disabled' : ''}>
      ${collected ? 'Spektrum gesammelt' : 'Spektrum sammeln'}
    </button>
  `;

  const backLink = document.getElementById('backToLab');
  (backLink ?? pageRoot).insertAdjacentElement('afterend', collectBar);

  const btn = document.getElementById('collectSpectrumBtn');
  btn?.addEventListener('click', () => {
    if (isSpectrumCollected(spectrumId)) return;
    markSpectrumCollected(spectrumId);
    btn.textContent = 'Spektrum gesammelt';
    btn.disabled = true;
  });
}