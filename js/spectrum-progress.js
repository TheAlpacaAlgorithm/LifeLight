const PROGRESS_KEY = 'lifeLightProgress';

function canUseLocalStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readProgress() {
  if (!canUseLocalStorage()) {
    return { spectra: {}, selectedSpectrumId: null };
  }

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { spectra: {}, selectedSpectrumId: null };

    const parsed = JSON.parse(raw);
    const spectra = parsed && typeof parsed.spectra === 'object' && parsed.spectra !== null
      ? parsed.spectra
      : {};

    return {
      ...parsed,
      spectra,
      selectedSpectrumId: typeof parsed?.selectedSpectrumId === 'string' ? parsed.selectedSpectrumId : null,
    };
  } catch {
    return { spectra: {}, selectedSpectrumId: null };
  }
}

function writeProgress(progress) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function isSpectrumCollected(spectrumId) {
  const progress = readProgress();
  return Boolean(progress.spectra?.[spectrumId]);
}

export function markSpectrumCollected(spectrumId) {
  const progress = readProgress();
  progress.spectra ||= {};
  progress.spectra[spectrumId] = true;
  writeProgress(progress);
  return progress;
}

export function getSelectedSpectrum() {
  return readProgress().selectedSpectrumId;
}

export function setSelectedSpectrum(spectrumId) {
  const progress = readProgress();
  progress.selectedSpectrumId = spectrumId;
  writeProgress(progress);
  return progress;
}




