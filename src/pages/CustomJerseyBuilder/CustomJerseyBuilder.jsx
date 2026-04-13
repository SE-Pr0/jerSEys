import React, { useEffect, useMemo, useRef, useState } from 'react';
import baseMask from './Assets/Base.svg';
import baseTexture from './Assets/Base_Texture.svg';
import collarMask from './Assets/Collar.svg';
import shadows from './Assets/Shadows.svg';
import sleeveMask from './Assets/Sleeve.svg';
import sleeveTexture from './Assets/Sleeve_Texture.svg';
import crackedPreset from './Assets/Presets/Cracked.png';
import flakesPreset from './Assets/Presets/Flakes.png';
import gridPreset from './Assets/Presets/Grid.png';
import hexPreset from './Assets/Presets/Hex.png';
import hexalinesPreset from './Assets/Presets/Hexalines-copy.png';
import nikeNetherlandsHomePreset from './Assets/Presets/Nike Netherlands Home.png';
import particlePreset from './Assets/Presets/Particle.png';
import squaredPreset from './Assets/Presets/Squared.png';
import squaresPreset from './Assets/Presets/Squares.png';
import trianglesPreset from './Assets/Presets/Triangles.png';
import voronoiFracturePreset from './Assets/Presets/Voronoi-Fracture.png';
import zagsPreset from './Assets/Presets/Zags.png';
import zigZagPreset from './Assets/Presets/Zig-Zag.png';
import './CustomJerseyBuilder.css';

const savedColorsKey = 'front-kit-layer-colors-v3';
const savedLogoKey = 'front-kit-badge-logo';
const savedFreeLogoKey = 'front-kit-free-logo';
const savedFreeLogoPositionKey = 'front-kit-free-logo-position';
const savedPresetKey = 'front-kit-preset';
const deprecatedPresetKeys = new Set([
  'Nike-Netherlands-Home-(From-the-International-Patterns-Pack).png',
  'Nike-Netherlands-Home-(From-the-International-Patterns-Pack)',
]);

const viewBox = {
  width: 1114,
  height: 622,
};

const layerDefaults = {
  baseColor: '#0f172a',
  sleeveColor: '#ffffff',
  presetColor: '#ffffff',
  collarColor: '#ffffff',
};

const freeLogoBoundary = {
  left: 14,
  top: 34,
  width: 25,
  height: 40,
};

const defaultFreeLogoPosition = {
  left: freeLogoBoundary.left + freeLogoBoundary.width / 2,
  top: freeLogoBoundary.top + freeLogoBoundary.height / 2,
  width: 8,
};

const presetSizes = {
  'Cracked.png': { x: 142, y: 95, width: 846, height: 564 },
  'Flakes.png': { x: 142, y: 95, width: 982, height: 565 },
  'Grid.png': { x: 137, y: 50, width: 1029, height: 541 },
  'Hex.png': { x: 68, y: 30, width: 1029, height: 605 },
  'Hexalines-copy.png': { x: 130, y: 30, width: 855, height: 605 },
  'Nike Netherlands Home.png': { x: 142, y: 95, width: 846, height: 500 },
  'Particle.png': { x: 142, y: 95, width: 822, height: 566 },
  'Squared.png': { x: 129, y: 70, width: 874, height: 605 },
  'Squares.png': { x: 8, y: -30, width: 1200, height: 900 },
  'Triangles.png': { x: 135, y: 50, width: 948, height: 553 },
  'Voronoi-Fracture.png': { x: 142, y: 50, width: 871, height: 544 },
  'Zags.png': { x: 50, y: 0, width: 1029, height: 605 },
  'Zig-Zag.png': { x: 142, y: 250, width: 1029, height: 89 },
};

const presetFiles = [
  { fileName: 'Cracked.png', src: crackedPreset },
  { fileName: 'Flakes.png', src: flakesPreset },
  { fileName: 'Grid.png', src: gridPreset },
  { fileName: 'Hex.png', src: hexPreset },
  { fileName: 'Hexalines-copy.png', src: hexalinesPreset },
  { fileName: 'Nike Netherlands Home.png', src: nikeNetherlandsHomePreset },
  { fileName: 'Particle.png', src: particlePreset },
  { fileName: 'Squared.png', src: squaredPreset },
  { fileName: 'Squares.png', src: squaresPreset },
  { fileName: 'Triangles.png', src: trianglesPreset },
  { fileName: 'Voronoi-Fracture.png', src: voronoiFracturePreset },
  { fileName: 'Zags.png', src: zagsPreset },
  { fileName: 'Zig-Zag.png', src: zigZagPreset },
];

const getPresetLabel = (fileName) =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const presets = presetFiles
  .map(({ fileName, src }) => {
    const id = fileName.replace(/\.[^.]+$/, '');

    return {
      id,
      fileName,
      name: getPresetLabel(fileName),
      src,
    };
  })
  .sort((first, second) => first.name.localeCompare(second.name));

const getDefaultDesign = () => ({
  ...layerDefaults,
  presetId: presets[0]?.id || '',
  badgeLogo: '',
  freeLogo: '',
  freeLogoAspect: '1 / 1',
  freeLogoPosition: defaultFreeLogoPosition,
});

const parseSavedPosition = (savedPosition) => {
  if (!savedPosition) {
    return defaultFreeLogoPosition;
  }

  const getPercent = (value, fallback, min = 0, max = 100) => {
    const percent = Number.parseFloat(value);
    return Number.isFinite(percent) && percent >= min && percent <= max ? percent : fallback;
  };

  return {
    left: getPercent(savedPosition.left, defaultFreeLogoPosition.left),
    top: getPercent(savedPosition.top, defaultFreeLogoPosition.top),
    width: getPercent(savedPosition.width, defaultFreeLogoPosition.width, 1),
  };
};

const readInitialDesign = () => {
  const defaultDesign = getDefaultDesign();

  try {
    const savedColors = JSON.parse(localStorage.getItem(savedColorsKey) || 'null');
    const savedPreset = localStorage.getItem(savedPresetKey);
    const savedPresetKeyIsDeprecated = deprecatedPresetKeys.has(savedPreset);
    const selectedPreset = presets.find((preset) => preset.fileName === savedPreset || preset.id === savedPreset);
    const savedFreeLogoPosition = JSON.parse(localStorage.getItem(savedFreeLogoPositionKey) || 'null');

    if (savedPresetKeyIsDeprecated) {
      localStorage.removeItem(savedPresetKey);
    }

    return {
      ...defaultDesign,
      baseColor: savedColors?.base || defaultDesign.baseColor,
      sleeveColor: savedColors?.sleeve || defaultDesign.sleeveColor,
      presetColor: savedColors?.preset || defaultDesign.presetColor,
      collarColor: savedColors?.collar || defaultDesign.collarColor,
      presetId: savedPresetKeyIsDeprecated ? defaultDesign.presetId : selectedPreset?.id || defaultDesign.presetId,
      badgeLogo: localStorage.getItem(savedLogoKey) || '',
      freeLogo: localStorage.getItem(savedFreeLogoKey) || '',
      freeLogoPosition: parseSavedPosition(savedFreeLogoPosition),
    };
  } catch {
    return defaultDesign;
  }
};

const cropTransparentPadding = (src) =>
  new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const alpha = pixels[(y * canvas.width + x) * 4 + 3];

          if (alpha > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        resolve(src);
        return;
      }

      const croppedCanvas = document.createElement('canvas');
      const croppedContext = croppedCanvas.getContext('2d');
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      croppedContext.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
      resolve(croppedCanvas.toDataURL('image/png'));
    };

    image.onerror = () => resolve(src);
    image.src = src;
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

const CustomJerseyBuilder = () => {
  const [design, setDesign] = useState(readInitialDesign);
  const [notice, setNotice] = useState('');
  const [isFreeLogoSelected, setIsFreeLogoSelected] = useState(false);
  const kitPreviewRef = useRef(null);
  const freeLogoRef = useRef(null);
  const freeLogoImageRef = useRef(null);
  const freeLogoHandleRef = useRef(null);
  const freeLogoBoundaryRef = useRef(null);
  const badgeUploadRef = useRef(null);
  const freeLogoUploadRef = useRef(null);
  const interactionRef = useRef({ mode: null, moveOffset: null, resizeStart: null });

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === design.presetId) || presets[0],
    [design.presetId],
  );

  const selectedPresetSize = selectedPreset
    ? presetSizes[selectedPreset.fileName] || { x: 0, y: 0, width: viewBox.width, height: viewBox.height }
    : { x: 0, y: 0, width: viewBox.width, height: viewBox.height };

  const hasFreeLogo = Boolean(design.freeLogo);

  const previewStyle = {
    '--base-mask': `url(${baseMask})`,
    '--sleeve-mask': `url(${sleeveMask})`,
    '--collar-mask': `url(${collarMask})`,
    '--base-color': design.baseColor,
    '--sleeve-color': design.sleeveColor,
    '--preset-color': design.presetColor,
    '--collar-color': design.collarColor,
    '--texture-opacity': 0.46,
    '--shadow-opacity': 0.8,
  };

  const patternStyle = selectedPreset
    ? {
        '--preset-image': `url(${selectedPreset.src})`,
        '--preset-x': `${(selectedPresetSize.x / viewBox.width) * 100}%`,
        '--preset-y': `${(selectedPresetSize.y / viewBox.height) * 100}%`,
        '--preset-width': `${(selectedPresetSize.width / viewBox.width) * 100}%`,
        '--preset-height': `${(selectedPresetSize.height / viewBox.height) * 100}%`,
      }
    : {};

  const freeLogoStyle = {
    left: `${design.freeLogoPosition.left}%`,
    top: `${design.freeLogoPosition.top}%`,
    width: `${design.freeLogoPosition.width}%`,
    '--free-logo-aspect': design.freeLogoAspect,
  };

  const freeLogoBoundaryStyle = {
    '--free-logo-area-left': `${freeLogoBoundary.left}%`,
    '--free-logo-area-top': `${freeLogoBoundary.top}%`,
    '--free-logo-area-width': `${freeLogoBoundary.width}%`,
    '--free-logo-area-height': `${freeLogoBoundary.height}%`,
  };

  const updateDesign = (updates) => {
    setDesign((currentDesign) => ({ ...currentDesign, ...updates }));
    setNotice('');
  };

  const updateFreeLogoPosition = (updates) => {
    setDesign((currentDesign) => ({
      ...currentDesign,
      freeLogoPosition: {
        ...currentDesign.freeLogoPosition,
        ...updates,
      },
    }));
  };

  const saveFreeLogoPosition = (position = design.freeLogoPosition) => {
    localStorage.setItem(
      savedFreeLogoPositionKey,
      JSON.stringify({
        left: `${position.left}%`,
        top: `${position.top}%`,
        width: `${position.width}%`,
      }),
    );
  };

  const clampLogoToBoundary = (clientX, clientY, nextWidthPercent = design.freeLogoPosition.width) => {
    const stackRect = kitPreviewRef.current?.getBoundingClientRect();
    const boundaryRect = freeLogoBoundaryRef.current?.getBoundingClientRect();
    const logoRect = freeLogoRef.current?.getBoundingClientRect();

    if (!stackRect || !boundaryRect || !logoRect) {
      return design.freeLogoPosition;
    }

    const nextWidth = (stackRect.width * nextWidthPercent) / 100;
    const logoRatio = logoRect.height / logoRect.width || 1;
    const nextHeight = nextWidth * logoRatio;
    const halfWidth = nextWidth / 2;
    const halfHeight = nextHeight / 2;
    const minX = boundaryRect.left - stackRect.left + halfWidth;
    const maxX = boundaryRect.right - stackRect.left - halfWidth;
    const minY = boundaryRect.top - stackRect.top + halfHeight;
    const maxY = boundaryRect.bottom - stackRect.top - halfHeight;
    const fallbackX = (minX + maxX) / 2;
    const fallbackY = (minY + maxY) / 2;
    const x = Math.min(Math.max(clientX - stackRect.left, minX), maxX);
    const y = Math.min(Math.max(clientY - stackRect.top, minY), maxY);
    const safeX = minX <= maxX ? x : fallbackX;
    const safeY = minY <= maxY ? y : fallbackY;
    const nextPosition = {
      left: (safeX / stackRect.width) * 100,
      top: (safeY / stackRect.height) * 100,
      width: nextWidthPercent,
    };

    updateFreeLogoPosition(nextPosition);
    return nextPosition;
  };

  const getMaxFreeLogoWidth = () => {
    const boundaryRect = freeLogoBoundaryRef.current?.getBoundingClientRect();
    const logoRect = freeLogoRef.current?.getBoundingClientRect();
    const stackRect = kitPreviewRef.current?.getBoundingClientRect();

    if (!boundaryRect || !logoRect || !stackRect) {
      return 100;
    }

    const centerX = logoRect.left + logoRect.width / 2;
    const centerY = logoRect.top + logoRect.height / 2;
    const availableWidth = Math.min(centerX - boundaryRect.left, boundaryRect.right - centerX) * 2;
    const availableHeight = Math.min(centerY - boundaryRect.top, boundaryRect.bottom - centerY) * 2;
    const logoRatio = logoRect.height / logoRect.width || 1;
    return Math.max(20, Math.min(availableWidth, availableHeight / logoRatio));
  };

  const endFreeLogoInteraction = (event) => {
    if (!interactionRef.current.mode) {
      return;
    }

    freeLogoRef.current?.classList.remove('is-dragging');

    try {
      freeLogoRef.current?.releasePointerCapture(event.pointerId);
    } catch {}

    try {
      freeLogoHandleRef.current?.releasePointerCapture(event.pointerId);
    } catch {}

    interactionRef.current = { mode: null, moveOffset: null, resizeStart: null };
    saveFreeLogoPosition();
  };

  const handleBadgeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const logoSource = await readFileAsDataUrl(file);
    updateDesign({ badgeLogo: logoSource });

    try {
      localStorage.setItem(savedLogoKey, logoSource);
    } catch {
      setNotice('Logo added');
    }
  };

  const handleFreeLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const logoSource = await cropTransparentPadding(await readFileAsDataUrl(file));
    const nextDesign = {
      freeLogo: logoSource,
      freeLogoPosition: defaultFreeLogoPosition,
    };

    setDesign((currentDesign) => ({ ...currentDesign, ...nextDesign }));
    setIsFreeLogoSelected(true);
    setNotice('');

    try {
      localStorage.setItem(savedFreeLogoKey, logoSource);
      localStorage.removeItem(savedFreeLogoPositionKey);
    } catch {
      setNotice('Logo added');
    }
  };

  const handleFreeLogoLoad = () => {
    const image = freeLogoImageRef.current;

    if (!image?.naturalWidth || !image?.naturalHeight) {
      return;
    }

    setDesign((currentDesign) => ({
      ...currentDesign,
      freeLogoAspect: `${image.naturalWidth} / ${image.naturalHeight}`,
    }));
  };

  const handleFreeLogoPointerDown = (event) => {
    if (!hasFreeLogo) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const logoRect = freeLogoRef.current.getBoundingClientRect();
    setIsFreeLogoSelected(true);
    interactionRef.current = {
      mode: 'move',
      moveOffset: {
        x: event.clientX - (logoRect.left + logoRect.width / 2),
        y: event.clientY - (logoRect.top + logoRect.height / 2),
      },
      resizeStart: null,
    };
    freeLogoRef.current.classList.add('is-dragging');
    freeLogoRef.current.setPointerCapture(event.pointerId);
  };

  const handleFreeLogoPointerMove = (event) => {
    if (interactionRef.current.mode !== 'move') {
      return;
    }

    event.preventDefault();
    clampLogoToBoundary(
      event.clientX - interactionRef.current.moveOffset.x,
      event.clientY - interactionRef.current.moveOffset.y,
    );
  };

  const handleFreeLogoResizePointerDown = (event) => {
    if (!hasFreeLogo) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const stackRect = kitPreviewRef.current.getBoundingClientRect();
    const logoRect = freeLogoRef.current.getBoundingClientRect();
    setIsFreeLogoSelected(true);
    interactionRef.current = {
      mode: 'resize',
      moveOffset: null,
      resizeStart: {
        startX: event.clientX,
        startY: event.clientY,
        startWidth: logoRect.width,
        stackWidth: stackRect.width,
      },
    };
    freeLogoHandleRef.current.setPointerCapture(event.pointerId);
  };

  const handleFreeLogoResizePointerMove = (event) => {
    if (interactionRef.current.mode !== 'resize' || !interactionRef.current.resizeStart) {
      return;
    }

    event.preventDefault();
    const logoRect = freeLogoRef.current.getBoundingClientRect();
    const centerX = logoRect.left + logoRect.width / 2;
    const centerY = logoRect.top + logoRect.height / 2;
    const delta = Math.max(
      event.clientX - interactionRef.current.resizeStart.startX,
      event.clientY - interactionRef.current.resizeStart.startY,
    );
    const minWidth = interactionRef.current.resizeStart.stackWidth * 0.03;
    const maxWidth = getMaxFreeLogoWidth();
    const nextWidth = Math.min(
      Math.max(interactionRef.current.resizeStart.startWidth + delta, minWidth),
      maxWidth,
    );
    const nextWidthPercent = (nextWidth / interactionRef.current.resizeStart.stackWidth) * 100;
    clampLogoToBoundary(centerX, centerY, nextWidthPercent);
  };

  const handleSaveKit = () => {
    const selectedColors = {
      base: design.baseColor,
      sleeve: design.sleeveColor,
      preset: design.presetColor,
      collar: design.collarColor,
    };

    localStorage.setItem(savedColorsKey, JSON.stringify(selectedColors));

    if (selectedPreset) {
      localStorage.setItem(savedPresetKey, selectedPreset.fileName);
    }

    if (design.badgeLogo) {
      localStorage.setItem(savedLogoKey, design.badgeLogo);
    }

    if (design.freeLogo) {
      localStorage.setItem(savedFreeLogoKey, design.freeLogo);
      saveFreeLogoPosition(design.freeLogoPosition);
    }

    setNotice('Saved');
  };

  const handleReset = () => {
    localStorage.removeItem(savedColorsKey);
    localStorage.removeItem(savedLogoKey);
    localStorage.removeItem(savedFreeLogoKey);
    localStorage.removeItem(savedFreeLogoPositionKey);
    localStorage.removeItem(savedPresetKey);
    setDesign(getDefaultDesign());
    setIsFreeLogoSelected(false);

    if (badgeUploadRef.current) {
      badgeUploadRef.current.value = '';
    }

    if (freeLogoUploadRef.current) {
      freeLogoUploadRef.current.value = '';
    }

    setNotice('Reset');
  };

  useEffect(() => {
    if (!design.presetId && presets[0]) {
      setDesign((currentDesign) => ({ ...currentDesign, presetId: presets[0].id }));
    }
  }, [design.presetId]);

  useEffect(() => {
    const handleDocumentPointerDown = (event) => {
      if (freeLogoRef.current?.contains(event.target)) {
        return;
      }

      if (!interactionRef.current.mode) {
        setIsFreeLogoSelected(false);
      }
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
  }, []);

  return (
    <div className="custom-builder-page">
      <section className="custom-builder-hero">
        <div className="custom-builder-hero-bg" />
        <div className="custom-builder-hero-grid" />
        <div className="section-wrap custom-builder-hero-inner">
          <div className="custom-builder-copy">
            <p className="section-eyebrow">Kit Lab</p>
            <h1 className="section-title">
              Build Your <span>Own Jersey</span>
            </h1>
            <p className="custom-builder-subtitle">
              Pick colors, recolor the preset pattern, add a badge, and place a sponsor logo inside the
              printable chest area.
            </p>
          </div>

          <div className="custom-builder-summary" aria-label="Current custom jersey summary">
            <span>
              <strong>Preset</strong>
              {selectedPreset?.name || 'None'}
            </span>
            <span>
              <strong>Secondary</strong>
              {design.presetColor}
            </span>
            <span>
              <strong>Logos</strong>
              {design.badgeLogo || design.freeLogo ? 'Added' : 'None'}
            </span>
          </div>
        </div>
      </section>

      <section className="section-wrap custom-builder-workspace">
        <div className="custom-builder-preview ui-card" style={previewStyle}>
          <div
            className={`custom-builder-preview-stage ${isFreeLogoSelected ? 'is-free-logo-selected' : ''}`}
            ref={kitPreviewRef}
            aria-label="Custom kit preview"
          >
            <div className="jersey-layer jersey-layer-base" />
            <div className="jersey-layer jersey-layer-pattern" style={patternStyle}>
              {selectedPreset && <div className="jersey-layer-pattern-mask" />}
            </div>
            <img className="jersey-layer jersey-layer-texture" src={baseTexture} alt="" aria-hidden="true" />
            <div className="jersey-layer jersey-layer-sleeve" />
            <img className="jersey-layer jersey-layer-sleeve-texture" src={sleeveTexture} alt="" aria-hidden="true" />
            <div className="jersey-layer jersey-layer-collar" />
            <img className="jersey-layer jersey-layer-shadow" src={shadows} alt="" aria-hidden="true" />

            {design.badgeLogo && <img className="badge-logo" src={design.badgeLogo} alt="" />}

            <div
              className="free-logo-boundary"
              ref={freeLogoBoundaryRef}
              style={freeLogoBoundaryStyle}
              aria-hidden="true"
            />
            {design.freeLogo && (
              <div
                className={`free-logo ${isFreeLogoSelected ? 'is-selected' : ''}`}
                ref={freeLogoRef}
                style={freeLogoStyle}
                aria-label="Sponsor logo"
                role="img"
                onPointerCancel={endFreeLogoInteraction}
                onPointerDown={handleFreeLogoPointerDown}
                onPointerMove={handleFreeLogoPointerMove}
                onPointerUp={endFreeLogoInteraction}
              >
                <img
                  className="free-logo-image"
                  ref={freeLogoImageRef}
                  src={design.freeLogo}
                  alt=""
                  draggable="false"
                  onLoad={handleFreeLogoLoad}
                />
                <span
                  className="free-logo-handle"
                  ref={freeLogoHandleRef}
                  aria-hidden="true"
                  onPointerCancel={endFreeLogoInteraction}
                  onPointerDown={handleFreeLogoResizePointerDown}
                  onPointerMove={handleFreeLogoResizePointerMove}
                  onPointerUp={endFreeLogoInteraction}
                />
              </div>
            )}
          </div>
        </div>

        <aside className="custom-builder-panel ui-card is-padded" aria-label="Customize jersey controls">
          <div className="custom-builder-panel-heading">
            <p className="section-eyebrow">Controls</p>
            <h2>Custom Kit Maker</h2>
          </div>

          <div className="ui-form">
            <div className="ui-form-section">
              <div className="custom-builder-section-title">
                <span>01</span>
                Pattern
              </div>
              <div className="preset-grid">
                {presets.map((preset) => (
                  <button
                    className={`preset-card ${preset.id === selectedPreset?.id ? 'is-active' : ''}`}
                    key={preset.id}
                    onClick={() => updateDesign({ presetId: preset.id })}
                    type="button"
                  >
                    <img src={preset.src} alt="" aria-hidden="true" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ui-form-section">
              <div className="custom-builder-section-title">
                <span>02</span>
                Color
              </div>
              <div className="custom-color-grid">
                {[
                  ['Base', 'baseColor'],
                  ['Sleeves', 'sleeveColor'],
                  ['Secondary color', 'presetColor'],
                  ['Collar', 'collarColor'],
                ].map(([label, key]) => (
                  <label className="custom-color-field" key={key}>
                    <span>{label}</span>
                    <input
                      aria-label={`${label} color`}
                      type="color"
                      value={design[key]}
                      onChange={(event) => updateDesign({ [key]: event.target.value })}
                    />
                    <em>{design[key]}</em>
                  </label>
                ))}
              </div>
            </div>

            <div className="ui-form-section">
              <div className="custom-builder-section-title">
                <span>03</span>
                Logos
              </div>
              <label className="custom-file-field">
                <span>Badge logo</span>
                <input ref={badgeUploadRef} type="file" accept="image/*" onChange={handleBadgeUpload} />
              </label>
              <label className="custom-file-field">
                <span>Sponsor logo</span>
                <input ref={freeLogoUploadRef} type="file" accept="image/*" onChange={handleFreeLogoUpload} />
              </label>
              <p className="custom-builder-helper">
                Click the sponsor logo to show the boundary, drag it around, or pull the corner handle to resize it.
              </p>
            </div>

            {notice && <p className="custom-builder-notice">{notice}</p>}

            <div className="custom-builder-actions">
              <button className="ui-button is-primary" type="button" onClick={handleSaveKit}>
                Save kit
              </button>
              <button className="ui-button is-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CustomJerseyBuilder;
