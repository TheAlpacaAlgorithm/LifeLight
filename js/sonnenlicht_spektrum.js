import { isSpectrumCollected, markSpectrumCollected } from './spectrum-progress.js';

const spectrumId = 'sonnenlicht';
const pageRoot = document.body.firstElementChild;

if (!pageRoot) {
  throw new Error('Seitencontainer wurde nicht gefunden.');
}

const collected = isSpectrumCollected(spectrumId);

const collectBar = document.createElement('div');
collectBar.className = 'collect-spectrum-bar';
collectBar.innerHTML = `
  <button id="collectSpectrumBtn" class="button collect-spectrum-button" type="button" ${collected ? 'disabled' : ''}>
    ${collected ? 'Spektrum gesammelt' : 'Spektrum sammeln'}
  </button>
`;

document.getElementById('backToLab').insertAdjacentElement('afterend', collectBar);

const collectButton = document.getElementById('collectSpectrumBtn');
collectButton?.addEventListener('click', () => {
  if (isSpectrumCollected(spectrumId)) return;
  markSpectrumCollected(spectrumId);
  if (collectButton) {
    collectButton.textContent = 'Spektrum gesammelt';
    collectButton.disabled = true;
  }
});
