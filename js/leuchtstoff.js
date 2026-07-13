const app_lsr = document.querySelector('#app-lsr');

const imageSrc = '../images/03_Leuchtstoffröhre.jpg';

const hotspots = [
    {
        label: 'Nimm das Spektrum auf',
        href: '../subsites/leuchtstoff_spektrum.html',
        x: 2,
        y: 15,
        w: 10,
        h: 15,
    },
    {
        label: 'Hier geht es zur Auswertung',
        href: 'deine-spektren.html',
        visible: true,
        x: 70,
        y: 90,
        w: 25,
        h: 5,
    },
    {
        label: 'Zurück zum Lichtlabor',
        href: '../index.html',
        visible: true,
        x: 5,
        y: 90,
        w: 25,
        h: 5,
    },
];

const shell = document.createElement('section');
shell.className = 'app-shell';

const image = document.createElement('img');
image.className = 'app-shell__image';
image.src = imageSrc;
image.alt = 'Laborübersicht mit markierten Bereichen';
image.draggable = false;

const hotspotLayer = document.createElement('div');
hotspotLayer.className = 'hotspot-layer';

const hint = document.createElement('div');

shell.append(image, hotspotLayer);
app_lsr.replaceChildren(shell);

const hotspotElements = hotspots.map((hotspot) => {
    const link = document.createElement('a');
    link.className = 'hotspot';
    link.href = hotspot.href;
    link.dataset.label = hotspot.label;
    link.setAttribute('aria-label', hotspot.label);
    link.title = hotspot.label;
    link.style.left = '0px';
    link.style.top = '0px';
    link.style.width = '0px';
    link.style.height = '0px';
    // If the hotspot should be visible as a standard button, add the class and label text
    if (hotspot.visible) {
        link.classList.add('visible');
        link.textContent = hotspot.label;
        link.setAttribute('role', 'button');
        link.dataset.label = '';
    }
    hotspotLayer.appendChild(link);
    return { ...hotspot, element: link };
});

function fitContain(naturalWidth, naturalHeight, containerWidth, containerHeight) {
    // scale so the whole image fits inside the container
    const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    return {
        scale,
        width,
        height,
        offsetX: (containerWidth - width) / 2,
        offsetY: (containerHeight - height) / 2,
    };
}

function layoutHotspots() {
    const naturalWidth = image.naturalWidth || 1920;
    const naturalHeight = image.naturalHeight || 1080;
    const { width: containerWidth, height: containerHeight } = shell.getBoundingClientRect();
    if (!containerWidth || !containerHeight) {
        return;
    }

    const fitted = fitContain(naturalWidth, naturalHeight, containerWidth, containerHeight);

    hotspotElements.forEach((hotspot) => {
        const left = fitted.offsetX + (hotspot.x / 100) * fitted.width;
        const top = fitted.offsetY + (hotspot.y / 100) * fitted.height;
        const width = (hotspot.w / 100) * fitted.width;
        const height = (hotspot.h / 100) * fitted.height;

        hotspot.element.style.left = `${left}px`;
        hotspot.element.style.top = `${top}px`;
        hotspot.element.style.width = `${width}px`;
        hotspot.element.style.height = `${height}px`;
    });
}

if (image.complete) {
    layoutHotspots();
} else {
    image.addEventListener('load', layoutHotspots, { once: true });
}

window.addEventListener('resize', layoutHotspots);

