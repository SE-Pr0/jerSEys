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
import { Button, Card } from '../../components/ui';
import './CustomJerseyBuilder.css';

const savedColorsKey = 'front-kit-layer-colors-v3';
const savedLogoKey = 'front-kit-badge-logo';
const savedFreeLogoKey = 'front-kit-free-logo';
const savedFreeLogoPositionKey = 'front-kit-free-logo-position';
const savedPresetKey = 'front-kit-preset';
const savedTextKey = 'front-kit-text';
const CART_STORAGE_KEY = 'jerseys-cart';
const CART_EVENT_NAME = 'jerseys-cart-change';
const CUSTOM_KIT_PRICE = 39.99;
const CUSTOM_KIT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
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

const textDefaults = {
  textName: '',
  textNumber: '',
  textColor: '#ffffff',
  textStrokeColor: '#000000',
  textStrokeWidth: 2,
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

const thumbnailBadgePlacement = {
  x: 0.204,
  y: 0.292,
  size: 0.052,
};

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
  ...textDefaults,
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
    const savedText = JSON.parse(localStorage.getItem(savedTextKey) || 'null');

    if (savedPresetKeyIsDeprecated) {
      localStorage.removeItem(savedPresetKey);
    }

    return {
      ...defaultDesign,
      baseColor: savedColors?.base || defaultDesign.baseColor,
      sleeveColor: savedColors?.sleeve || defaultDesign.sleeveColor,
      presetColor: savedColors?.preset || defaultDesign.presetColor,
      collarColor: savedColors?.collar || defaultDesign.collarColor,
      textName: savedText?.name || defaultDesign.textName,
      textNumber: savedText?.number || defaultDesign.textNumber,
      textColor: savedText?.color || defaultDesign.textColor,
      textStrokeColor: savedText?.strokeColor || defaultDesign.textStrokeColor,
      textStrokeWidth: Number.isFinite(Number(savedText?.strokeWidth))
        ? Number(savedText.strokeWidth)
        : defaultDesign.textStrokeWidth,
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

const findFrontBounds = (canvas) => {
  const sampleScale = 4;
  const sampleWidth = Math.max(1, Math.ceil(canvas.width / sampleScale));
  const sampleHeight = Math.max(1, Math.ceil(canvas.height / sampleScale));
  const sampleCanvas = createCanvas(sampleWidth, sampleHeight);
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });

  sampleContext.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);

  const { data } = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight);
  const visited = new Uint8Array(sampleWidth * sampleHeight);
  const components = [];
  const threshold = 12;
  const index = (x, y) => y * sampleWidth + x;

  for (let y = 0; y < sampleHeight; y += 1) {
    for (let x = 0; x < sampleWidth; x += 1) {
      const startIndex = index(x, y);

      if (visited[startIndex] || data[startIndex * 4 + 3] <= threshold) {
        continue;
      }

      let head = 0;
      const queue = [startIndex];
      visited[startIndex] = 1;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let area = 0;

      while (head < queue.length) {
        const current = queue[head++];
        const currentX = current % sampleWidth;
        const currentY = Math.floor(current / sampleWidth);

        area += 1;
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);

        const neighbors = [
          [currentX - 1, currentY],
          [currentX + 1, currentY],
          [currentX, currentY - 1],
          [currentX, currentY + 1],
        ];

        for (const [nextX, nextY] of neighbors) {
          if (nextX < 0 || nextY < 0 || nextX >= sampleWidth || nextY >= sampleHeight) {
            continue;
          }

          const neighborIndex = index(nextX, nextY);

          if (visited[neighborIndex] || data[neighborIndex * 4 + 3] <= threshold) {
            continue;
          }

          visited[neighborIndex] = 1;
          queue.push(neighborIndex);
        }
      }

      components.push({
        area,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        maxX,
        maxY,
        minX,
        minY,
      });
    }
  }

  if (!components.length) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  const largestArea = Math.max(...components.map((component) => component.area));
  const frontCandidates = components.filter((component) => component.area >= Math.max(20, largestArea * 0.45));
  const chosenComponent = (frontCandidates.length ? frontCandidates : components).sort(
    (first, second) => first.centerX - second.centerX || second.area - first.area,
  )[0];

  const padX = Math.max(2, Math.round((chosenComponent.maxX - chosenComponent.minX + 1) * 0.12));
  const padY = Math.max(2, Math.round((chosenComponent.maxY - chosenComponent.minY + 1) * 0.1));
  const x = Math.max(0, Math.floor((chosenComponent.minX - padX) * sampleScale));
  const y = Math.max(0, Math.floor((chosenComponent.minY - padY) * sampleScale));
  const width = Math.min(canvas.width - x, Math.ceil((chosenComponent.maxX - chosenComponent.minX + 1 + padX * 2) * sampleScale));
  const height = Math.min(canvas.height - y, Math.ceil((chosenComponent.maxY - chosenComponent.minY + 1 + padY * 2) * sampleScale));

  return { x, y, width, height };
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const parseAspectRatio = (value) => {
  if (typeof value !== 'string' || !value.includes('/')) {
    return 1;
  }

  const [rawWidth, rawHeight] = value.split('/').map((part) => Number.parseFloat(part.trim()));
  if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawHeight === 0) {
    return 1;
  }

  return rawWidth / rawHeight;
};

const drawImageContain = (context, image, targetX, targetY, targetWidth, targetHeight) => {
  const sourceWidth = image.naturalWidth || image.videoWidth || image.width || 1;
  const sourceHeight = image.naturalHeight || image.videoHeight || image.height || 1;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = targetX + (targetWidth - width) / 2;
  const y = targetY + (targetHeight - height) / 2;

  context.drawImage(image, x, y, width, height);
};

const applyMask = (context, maskImage, width, height) => {
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(maskImage, 0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
};

const escapeSvgText = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const readStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT_NAME));
};

const buildCustomKitLineKey = (design, size) =>
  [
    'custom-kit',
    size || 'no-size',
    design.presetId || 'no-preset',
    design.baseColor || 'no-base',
    design.sleeveColor || 'no-sleeve',
    design.presetColor || 'no-preset-color',
    design.collarColor || 'no-collar',
    design.textName.trim() || 'no-name',
    design.textNumber.trim() || 'no-number',
    design.badgeLogo ? 'badge' : 'no-badge',
    design.freeLogo ? 'free-logo' : 'no-free-logo',
    design.freeLogoPosition
      ? `${design.freeLogoPosition.left}-${design.freeLogoPosition.top}-${design.freeLogoPosition.width}`
      : 'no-logo-position',
  ].join('|');

const buildCustomKitArtwork = async (
  design,
  selectedPreset,
  {
    includeBadgeLogo = true,
    includeFreeLogo = true,
  } = {},
) => {
  try {
    const [
      baseMaskImage,
      sleeveMaskImage,
      collarMaskImage,
      baseTextureImage,
      sleeveTextureImage,
      shadowsImage,
      patternImage,
      badgeLogoImage,
      freeLogoImage,
    ] = await Promise.all([
      loadImage(baseMask),
      loadImage(sleeveMask),
      loadImage(collarMask),
      loadImage(baseTexture),
      loadImage(sleeveTexture),
      loadImage(shadows),
      selectedPreset?.src ? loadImage(selectedPreset.src) : Promise.resolve(null),
      includeBadgeLogo && design.badgeLogo ? loadImage(design.badgeLogo) : Promise.resolve(null),
      includeFreeLogo && design.freeLogo ? loadImage(design.freeLogo) : Promise.resolve(null),
    ]);

    const jerseyCanvas = createCanvas(viewBox.width, viewBox.height);
    const jerseyContext = jerseyCanvas.getContext('2d');
    const boundsCanvas = createCanvas(viewBox.width, viewBox.height);
    const boundsContext = boundsCanvas.getContext('2d');
    const selectedPresetSize = selectedPreset
      ? presetSizes[selectedPreset.fileName] || { x: 0, y: 0, width: viewBox.width, height: viewBox.height }
      : { x: 0, y: 0, width: viewBox.width, height: viewBox.height };
    const freeLogoAspect = parseAspectRatio(design.freeLogoAspect);
    const freeLogoWidth = (design.freeLogoPosition.width / 100) * viewBox.width;
    const freeLogoHeight = freeLogoImage ? freeLogoWidth / freeLogoAspect : freeLogoWidth;
    const freeLogoX = (design.freeLogoPosition.left / 100) * viewBox.width - freeLogoWidth / 2;
    const freeLogoY = (design.freeLogoPosition.top / 100) * viewBox.height - freeLogoHeight / 2;
    const badgeLogoX = viewBox.width * thumbnailBadgePlacement.x-18;
    const badgeLogoY = viewBox.height * thumbnailBadgePlacement.y -25;
    const badgeLogoSize = viewBox.width * thumbnailBadgePlacement.size;
    const renderLayer = (paintLayer) => {
      const layerCanvas = createCanvas(jerseyCanvas.width, jerseyCanvas.height);
      const layerContext = layerCanvas.getContext('2d');
      paintLayer(layerContext, layerCanvas);
      return layerCanvas;
    };

    const baseLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.fillStyle = design.baseColor || '#0f172a';
      layerContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      applyMask(layerContext, baseMaskImage, layerCanvas.width, layerCanvas.height);
    });

    const patternLayer = patternImage
      ? renderLayer((layerContext, layerCanvas) => {
          layerContext.fillStyle = design.presetColor || '#ffffff';
          layerContext.fillRect(
            selectedPresetSize.x,
            selectedPresetSize.y,
            selectedPresetSize.width,
            selectedPresetSize.height,
          );
          layerContext.globalCompositeOperation = 'destination-in';
          layerContext.drawImage(
            patternImage,
            selectedPresetSize.x,
            selectedPresetSize.y,
            selectedPresetSize.width,
            selectedPresetSize.height,
          );
          layerContext.globalCompositeOperation = 'source-over';
          applyMask(layerContext, baseMaskImage, layerCanvas.width, layerCanvas.height);
        })
      : null;

    const baseTextureLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.globalAlpha = 0.42;
      layerContext.drawImage(baseTextureImage, 0, 0, layerCanvas.width, layerCanvas.height);
      applyMask(layerContext, baseMaskImage, layerCanvas.width, layerCanvas.height);
    });

    const sleeveLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.fillStyle = design.sleeveColor || '#ffffff';
      layerContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      applyMask(layerContext, sleeveMaskImage, layerCanvas.width, layerCanvas.height);
    });

    const sleeveTextureLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.globalAlpha = 0.38;
      layerContext.drawImage(sleeveTextureImage, 0, 0, layerCanvas.width, layerCanvas.height);
      applyMask(layerContext, sleeveMaskImage, layerCanvas.width, layerCanvas.height);
    });

    const collarLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.fillStyle = design.collarColor || '#ffffff';
      layerContext.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
      applyMask(layerContext, collarMaskImage, layerCanvas.width, layerCanvas.height);
    });

    const shadowLayer = renderLayer((layerContext, layerCanvas) => {
      layerContext.drawImage(shadowsImage, 0, 0, layerCanvas.width, layerCanvas.height);
    });

    jerseyContext.drawImage(baseLayer, 0, 0);
    if (patternLayer) {
      jerseyContext.drawImage(patternLayer, 0, 0);
    }
    jerseyContext.save();
    jerseyContext.globalCompositeOperation = 'multiply';
    jerseyContext.drawImage(baseTextureLayer, 0, 0);
    jerseyContext.restore();
    jerseyContext.drawImage(sleeveLayer, 0, 0);
    jerseyContext.save();
    jerseyContext.globalCompositeOperation = 'multiply';
    jerseyContext.drawImage(sleeveTextureLayer, 0, 0);
    jerseyContext.restore();
    jerseyContext.drawImage(collarLayer, 0, 0);
    jerseyContext.save();
    jerseyContext.globalAlpha = 0.74;
    jerseyContext.globalCompositeOperation = 'multiply';
    jerseyContext.drawImage(shadowLayer, 0, 0);
    jerseyContext.restore();

    boundsContext.drawImage(baseLayer, 0, 0);
    if (patternLayer) {
      boundsContext.drawImage(patternLayer, 0, 0);
    }
    boundsContext.drawImage(sleeveLayer, 0, 0);
    boundsContext.drawImage(collarLayer, 0, 0);

    if (includeBadgeLogo && badgeLogoImage) {
      drawImageContain(jerseyContext, badgeLogoImage, badgeLogoX, badgeLogoY, badgeLogoSize, badgeLogoSize);
      drawImageContain(boundsContext, badgeLogoImage, badgeLogoX, badgeLogoY, badgeLogoSize, badgeLogoSize);
    }

    if (includeFreeLogo && freeLogoImage) {
      drawImageContain(jerseyContext, freeLogoImage, freeLogoX, freeLogoY, freeLogoWidth, freeLogoHeight);
      drawImageContain(boundsContext, freeLogoImage, freeLogoX, freeLogoY, freeLogoWidth, freeLogoHeight);
    }

    return { jerseyCanvas, boundsCanvas };
  } catch (error) {
    throw error;
  }
};

const buildCustomKitThumbnail = async (design, selectedPreset) => {
  try {
    const { jerseyCanvas, boundsCanvas } = await buildCustomKitArtwork(design, selectedPreset, {
      includeBadgeLogo: true,
      includeFreeLogo: true,
    });

    const thumbnailCanvas = createCanvas(900, 900);
    const thumbnailContext = thumbnailCanvas.getContext('2d');
    const frontBounds = findFrontBounds(boundsCanvas);
    const frontCanvas = createCanvas(frontBounds.width, frontBounds.height);
    const frontContext = frontCanvas.getContext('2d');

    frontContext.drawImage(
      jerseyCanvas,
      frontBounds.x,
      frontBounds.y,
      frontBounds.width,
      frontBounds.height,
      0,
      0,
      frontBounds.width,
      frontBounds.height,
    );

    thumbnailContext.fillStyle = '#ffffff';
    thumbnailContext.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    thumbnailContext.imageSmoothingEnabled = true;
    thumbnailContext.imageSmoothingQuality = 'high';
    drawImageContain(thumbnailContext, frontCanvas, 50, 38, thumbnailCanvas.width - 76, thumbnailCanvas.height - 76);

    return thumbnailCanvas.toDataURL('image/png');
  } catch {
    const patternSrc = escapeSvgText(selectedPreset?.src || '');
    const badgeLogo = escapeSvgText(design.badgeLogo || '');
    const freeLogo = escapeSvgText(design.freeLogo || '');
    const baseColor = escapeSvgText(design.baseColor || '#0f172a');
    const sleeveColor = escapeSvgText(design.sleeveColor || '#ffffff');
    const presetColor = escapeSvgText(design.presetColor || '#ffffff');
    const collarColor = escapeSvgText(design.collarColor || '#ffffff');
    const selectedPresetSize = selectedPreset
      ? presetSizes[selectedPreset.fileName] || { x: 0, y: 0, width: viewBox.width, height: viewBox.height }
      : { x: 0, y: 0, width: viewBox.width, height: viewBox.height };

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1114 622" role="img" aria-label="Custom jersey preview">
        <defs>
          <mask id="baseFillMask">
            <image href="${baseMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
          <mask id="sleeveFillMask">
            <image href="${sleeveMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
          <mask id="collarFillMask">
            <image href="${collarMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
        </defs>
        <rect width="1114" height="622" rx="24" fill="#ffffff" />
        <rect x="0" y="0" width="1114" height="622" fill="${baseColor}" mask="url(#baseFillMask)" />
        ${patternSrc ? `<image href="${patternSrc}" x="${selectedPresetSize.x}" y="${selectedPresetSize.y}" width="${selectedPresetSize.width}" height="${selectedPresetSize.height}" preserveAspectRatio="xMidYMid slice" mask="url(#baseFillMask)" opacity="0.98" />` : ''}
        <rect x="0" y="0" width="1114" height="622" fill="${presetColor}" mask="url(#baseFillMask)" opacity="0.14" />
        <image href="${baseTexture}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.42" mask="url(#baseFillMask)" />
        <rect x="0" y="0" width="1114" height="622" fill="${sleeveColor}" mask="url(#sleeveFillMask)" />
        <image href="${sleeveTexture}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.38" mask="url(#sleeveFillMask)" />
        <rect x="0" y="0" width="1114" height="622" fill="${collarColor}" mask="url(#collarFillMask)" />
        <image href="${shadows}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.74" />
        ${badgeLogo ? `<image href="${badgeLogo}" x="430" y="232" width="85" height="85" preserveAspectRatio="xMidYMid meet" />` : ''}
        ${freeLogo ? `<image href="${freeLogo}" x="350" y="278" width="420" height="150" preserveAspectRatio="xMidYMid meet" />` : ''}
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
};

const buildCustomKitPreviewArt = async (design, selectedPreset) => {
  try {
    const { jerseyCanvas } = await buildCustomKitArtwork(design, selectedPreset, {
      includeBadgeLogo: false,
      includeFreeLogo: false,
    });

    return jerseyCanvas.toDataURL('image/png');
  } catch {
    const patternSrc = escapeSvgText(selectedPreset?.src || '');
    const baseColor = escapeSvgText(design.baseColor || '#0f172a');
    const sleeveColor = escapeSvgText(design.sleeveColor || '#ffffff');
    const presetColor = escapeSvgText(design.presetColor || '#ffffff');
    const collarColor = escapeSvgText(design.collarColor || '#ffffff');
    const selectedPresetSize = selectedPreset
      ? presetSizes[selectedPreset.fileName] || { x: 0, y: 0, width: viewBox.width, height: viewBox.height }
      : { x: 0, y: 0, width: viewBox.width, height: viewBox.height };

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1114 622" role="img" aria-label="Custom jersey preview">
        <defs>
          <mask id="baseFillMask">
            <image href="${baseMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
          <mask id="sleeveFillMask">
            <image href="${sleeveMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
          <mask id="collarFillMask">
            <image href="${collarMask}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" />
          </mask>
        </defs>
        <rect width="1114" height="622" rx="24" fill="#ffffff" />
        <rect x="0" y="0" width="1114" height="622" fill="${baseColor}" mask="url(#baseFillMask)" />
        ${patternSrc ? `<image href="${patternSrc}" x="${selectedPresetSize.x}" y="${selectedPresetSize.y}" width="${selectedPresetSize.width}" height="${selectedPresetSize.height}" preserveAspectRatio="xMidYMid slice" mask="url(#baseFillMask)" opacity="0.98" />` : ''}
        <rect x="0" y="0" width="1114" height="622" fill="${presetColor}" mask="url(#baseFillMask)" opacity="0.14" />
        <image href="${baseTexture}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.42" mask="url(#baseFillMask)" />
        <rect x="0" y="0" width="1114" height="622" fill="${sleeveColor}" mask="url(#sleeveFillMask)" />
        <image href="${sleeveTexture}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.38" mask="url(#sleeveFillMask)" />
        <rect x="0" y="0" width="1114" height="622" fill="${collarColor}" mask="url(#collarFillMask)" />
        <image href="${shadows}" x="0" y="0" width="1114" height="622" preserveAspectRatio="none" opacity="0.74" />
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
};

const CustomJerseyBuilder = () => {
  const [design, setDesign] = useState(readInitialDesign);
  const [notice, setNotice] = useState('');
  const [isFreeLogoSelected, setIsFreeLogoSelected] = useState(false);
  const [activeControlSection, setActiveControlSection] = useState('pattern');
  const [isSizePromptOpen, setIsSizePromptOpen] = useState(false);
  const [selectedCartSize, setSelectedCartSize] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewArtwork, setPreviewArtwork] = useState('');
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

  const hasFreeLogo = Boolean(design.freeLogo);

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

  const jerseyTextStyle = {
    color: design.textColor,
    '--text-color': design.textColor,
    '--text-stroke-color': design.textStrokeColor,
    '--text-stroke-width': `${design.textStrokeWidth}px`,
  };

  const updateDesign = (updates) => {
    setDesign((currentDesign) => ({ ...currentDesign, ...updates }));
    setNotice('');
  };

  useEffect(() => {
    let isCurrent = true;

    const renderPreview = async () => {
      const artwork = await buildCustomKitPreviewArt(design, selectedPreset);

      if (isCurrent) {
        setPreviewArtwork(artwork);
      }
    };

    renderPreview();

    return () => {
      isCurrent = false;
    };
  }, [
    design.baseColor,
    design.sleeveColor,
    design.presetColor,
    design.collarColor,
    selectedPreset?.id,
    selectedPreset?.src,
  ]);

  const controlSections = [
    { id: 'pattern', label: 'Pattern' },
    { id: 'colors', label: 'Colors' },
    { id: 'logos', label: 'Logos' },
    { id: 'text', label: 'Text' },
  ];

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

  const handleOpenAddToCart = () => {
    setSelectedCartSize('');
    setIsSizePromptOpen(true);
    setNotice('');
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedCartSize) {
      setNotice('Pick a size first.');
      return;
    }

    const thumbnailImage = await buildCustomKitThumbnail(design, selectedPreset);

    const nextCartItem = {
      cartKey: buildCustomKitLineKey(design, selectedCartSize),
      id: `custom-kit-${selectedPreset?.id || 'custom'}`,
      productId: `custom-kit-${selectedPreset?.id || 'custom'}`,
      itemType: 'custom-kit',
      name: 'Custom jersey',
      title: 'Custom jersey',
      team: 'Made to order',
      sportLabel: 'Custom kit',
      categoryLabel: selectedPreset?.name || 'Custom build',
      season: 'Made to order',
      image: thumbnailImage,
      imageFocus: 'center center',
      badge: '',
      price: CUSTOM_KIT_PRICE,
      unitPrice: CUSTOM_KIT_PRICE,
      quantity: 1,
      size: selectedCartSize,
      selectedSize: selectedCartSize,
      playerName: design.textName.trim(),
      playerNumber: design.textNumber.trim(),
      text: [design.textName.trim(), design.textNumber.trim()].filter(Boolean).join(' # '),
      notes: '',
      badgeLogo: design.badgeLogo,
      freeLogo: design.freeLogo,
      freeLogoPosition: design.freeLogoPosition,
      presetId: selectedPreset?.id || '',
      presetName: selectedPreset?.name || '',
      presetImage: selectedPreset?.src || '',
      baseColor: design.baseColor,
      sleeveColor: design.sleeveColor,
      presetColor: design.presetColor,
      collarColor: design.collarColor,
      textColor: design.textColor,
      textStrokeColor: design.textStrokeColor,
      textStrokeWidth: design.textStrokeWidth,
      customization: {
        playerName: design.textName.trim(),
        playerNumber: design.textNumber.trim(),
        summary: [`Size ${selectedCartSize}`, selectedPreset?.name || 'Custom build'].join(' / '),
        badgeLogo: design.badgeLogo,
        freeLogo: design.freeLogo,
        freeLogoPosition: design.freeLogoPosition,
        presetId: selectedPreset?.id || '',
        presetName: selectedPreset?.name || '',
        presetImage: selectedPreset?.src || '',
        baseColor: design.baseColor,
        sleeveColor: design.sleeveColor,
        presetColor: design.presetColor,
        collarColor: design.collarColor,
        colors: {
          base: design.baseColor,
          sleeve: design.sleeveColor,
          secondary: design.presetColor,
          collar: design.collarColor,
        },
        textColor: design.textColor,
        strokeColor: design.textStrokeColor,
        strokeWidth: design.textStrokeWidth,
      },
      previewColors: {
        base: design.baseColor,
        sleeve: design.sleeveColor,
        secondary: design.presetColor,
        collar: design.collarColor,
      },
    };

    const currentCart = readStoredCart();
    const existingItemIndex = currentCart.findIndex((item) => item.cartKey === nextCartItem.cartKey);

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex] = {
        ...currentCart[existingItemIndex],
        ...nextCartItem,
        quantity: Number(currentCart[existingItemIndex].quantity || 1) + 1,
      };
    } else {
      currentCart.push(nextCartItem);
    }

    writeStoredCart(currentCart);
    setIsSizePromptOpen(false);
    setNotice(`Added to cart: Custom jersey in ${selectedCartSize}.`);
  };

  const handleResetSizePrompt = () => {
    setIsSizePromptOpen(false);
    setSelectedCartSize('');
  };

  const handleReset = () => {
    localStorage.removeItem(savedColorsKey);
    localStorage.removeItem(savedLogoKey);
    localStorage.removeItem(savedFreeLogoKey);
    localStorage.removeItem(savedFreeLogoPositionKey);
    localStorage.removeItem(savedPresetKey);
    localStorage.removeItem(savedTextKey);
    setDesign(getDefaultDesign());
    setIsFreeLogoSelected(false);
    setActiveControlSection('pattern');

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

  useEffect(() => {
    if (!isSizePromptOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleResetSizePrompt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSizePromptOpen]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className={`custom-builder-page ${isLoaded ? 'is-loaded' : ''}`}>
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
        <div className="custom-builder-preview ui-card">
          <div
            className={`custom-builder-preview-stage ${isFreeLogoSelected ? 'is-free-logo-selected' : ''}`}
            ref={kitPreviewRef}
            aria-label="Custom kit preview"
          >
            {previewArtwork ? (
              <img
                className="custom-builder-preview-art"
                src={previewArtwork}
                alt=""
                aria-hidden="true"
              />
            ) : null}

            {design.badgeLogo && <img className="badge-logo" src={design.badgeLogo} alt="" />}
            {(design.textName || design.textNumber) && (
              <div className="jersey-print jersey-print-back" style={jerseyTextStyle} aria-hidden="true">
                {design.textName && <strong>{design.textName}</strong>}
                {design.textNumber && <span>{design.textNumber}</span>}
              </div>
            )}

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
            <div className="custom-builder-section-tabs" role="tablist" aria-label="Customizer sections">
              {controlSections.map((section, index) => (
                <button
                  className={`custom-builder-section-tab ${activeControlSection === section.id ? 'is-active' : ''}`}
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={activeControlSection === section.id}
                  onClick={() => setActiveControlSection(section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </button>
              ))}
            </div>

            {activeControlSection === 'pattern' && (
              <div className="ui-form-section custom-builder-section-panel" role="tabpanel">
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
            )}

            {activeControlSection === 'colors' && (
              <div className="ui-form-section custom-builder-section-panel" role="tabpanel">
                <div className="custom-builder-section-title">
                  <span>02</span>
                  Colors
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
            )}

            {activeControlSection === 'logos' && (
              <div className="ui-form-section custom-builder-section-panel" role="tabpanel">
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
            )}

            {activeControlSection === 'text' && (
              <div className="ui-form-section custom-builder-section-panel" role="tabpanel">
                <div className="custom-builder-section-title">
                  <span>04</span>
                  Text
                </div>
                <div className="custom-text-grid">
                  <label className="custom-text-field">
                    <span>Name</span>
                    <input
                      className="ui-input"
                      maxLength="14"
                      placeholder="PLAYER"
                      type="text"
                      value={design.textName}
                      onChange={(event) => updateDesign({ textName: event.target.value.toUpperCase() })}
                    />
                  </label>
                  <label className="custom-text-field">
                    <span>Number</span>
                    <input
                      className="ui-input"
                      maxLength="2"
                      placeholder="10"
                      type="text"
                      value={design.textNumber}
                      onChange={(event) => updateDesign({ textNumber: event.target.value.replace(/\D/g, '').slice(0, 2) })}
                    />
                  </label>
                  <label className="custom-color-field custom-text-color-field">
                    <span>Text color</span>
                    <input
                      aria-label="Text color"
                      type="color"
                      value={design.textColor}
                      onChange={(event) => updateDesign({ textColor: event.target.value })}
                    />
                    <em>{design.textColor}</em>
                  </label>
                  <label className="custom-color-field custom-text-color-field">
                    <span>Stroke color</span>
                    <input
                      aria-label="Stroke color"
                      type="color"
                      value={design.textStrokeColor}
                      onChange={(event) => updateDesign({ textStrokeColor: event.target.value })}
                    />
                    <em>{design.textStrokeColor}</em>
                  </label>
                  <label className="custom-range-field">
                    <span>Stroke thickness</span>
                    <input
                      aria-label="Stroke thickness"
                      max="12"
                      min="0"
                      step="0.5"
                      type="range"
                      value={design.textStrokeWidth}
                      onChange={(event) =>
                        updateDesign({ textStrokeWidth: Number.parseFloat(event.target.value) })
                      }
                    />
                    <em>{design.textStrokeWidth}px</em>
                  </label>
                </div>
              </div>
            )}

            {notice && <p className="custom-builder-notice">{notice}</p>}

            <div className="custom-builder-actions">
              <Button type="button" onClick={handleOpenAddToCart}>
                Add to cart
              </Button>
              <button className="ui-button is-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </aside>
      </section>

      {isSizePromptOpen ? (
        <div
          className="custom-builder-size-overlay"
          role="presentation"
          onClick={handleResetSizePrompt}
        >
          <Card
            className="custom-builder-size-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="custom-builder-size-modal-header">
              <p className="section-eyebrow">Choose size</p>
              <h2>Pick a jersey size before we add it to cart.</h2>
            </div>

            <div className="custom-builder-size-grid" role="list" aria-label="Custom jersey sizes">
              {CUSTOM_KIT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`custom-builder-size-option${selectedCartSize === size ? ' is-selected' : ''}`}
                  onClick={() => setSelectedCartSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <p className="custom-builder-size-copy">
              Select one size, confirm, and the custom jersey will be added to your cart.
            </p>

            <div className="custom-builder-size-actions">
              <Button variant="secondary" type="button" onClick={handleResetSizePrompt}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmAddToCart} disabled={!selectedCartSize}>
                Confirm add
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default CustomJerseyBuilder;
