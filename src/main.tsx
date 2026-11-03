import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe Canvas roundRect polyfill for compatibility with older browsers/webviews
if (
  typeof CanvasRenderingContext2D !== 'undefined' &&
  !CanvasRenderingContext2D.prototype.roundRect
) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[]
  ) {
    const r = typeof radii === 'number' ? [radii, radii, radii, radii] : radii || [0, 0, 0, 0];
    const [tl = 0, tr = 0, br = 0, bl = 0] = Array.isArray(r) ? r : [0, 0, 0, 0];
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

// Prevent pinch-zoom and gesture zooming on mobile Safari
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(<App />);
