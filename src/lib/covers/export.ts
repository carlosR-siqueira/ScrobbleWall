import type { Album } from './metadata';
import type { CoverAsset } from './resolver';

export function renderCollage(albums: Album[], assets: CoverAsset[], gridSize: number,
  includeInfo: boolean, includePlayCount: boolean,
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas')): string {
  if (![3, 4, 5].includes(gridSize) || albums.length > gridSize * gridSize) throw new Error('invalid_grid');
  if (albums.length !== assets.length || assets.some(asset => !asset?.image)) throw new Error('unusable_cover');
  const canvas = createCanvas();
  const imageSize = 300;
  canvas.width = gridSize * imageSize;
  canvas.height = gridSize * imageSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');
  albums.forEach((album, i) => {
    const x = (i % gridSize) * imageSize;
    const y = Math.floor(i / gridSize) * imageSize;
    ctx.drawImage(assets[i].image, x, y, imageSize, imageSize);
    let currentY = y + imageSize;
    if (includeInfo) {
      currentY -= 50;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(x, currentY, imageSize, 50);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.fillText(album.name, x + 5, currentY + 20, 290);
      ctx.font = '12px Arial'; ctx.fillText(album.artist, x + 5, currentY + 35, 290);
    }
    if (includePlayCount) {
      currentY -= 30;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(x, currentY, imageSize, 30);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.fillText(`${album.playcount} plays`, x + 5, currentY + 20, 290);
    }
  });
  const data = canvas.toDataURL('image/png');
  if (!data.startsWith('data:image/png;base64,')) throw new Error('file_generation');
  return data;
}
