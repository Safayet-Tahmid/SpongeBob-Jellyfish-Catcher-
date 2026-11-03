import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CustomControlLayout } from '../../types/game';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onCatch: () => void;
  layout?: CustomControlLayout;
  sensitivity?: number;
}

interface TouchPointerState {
  startX: number;
  startY: number;
  anchorX: number;
  anchorY: number;
  startTime: number;
  isDrag: boolean;
}

interface TapRipple {
  id: number;
  x: number;
  y: number;
}

const TAP_DISTANCE_THRESHOLD = 12; // px movement threshold to distinguish tap from drag
const TAP_TIME_THRESHOLD = 320; // ms maximum duration for a tap
const MAX_DRAG_RADIUS = 55; // px maximum distance from anchor for 100% velocity
const DEADZONE = 6; // px inner deadzone

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onCatch,
  sensitivity = 1.0,
}) => {
  // Active pointer tracking map: pointerId -> TouchPointerState
  const pointersRef = useRef<Map<number, TouchPointerState>>(new Map());
  const dragPointerIdRef = useRef<number | null>(null);

  // Visual feedback states for subtle cartoon ocean cues
  const [dragVisual, setDragVisual] = useState<{
    anchorX: number;
    anchorY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [tapRipples, setTapRipples] = useState<TapRipple[]>([]);
  const rippleIdCounter = useRef(0);

  // Spawn a quick cartoon ripple burst at tap position
  const triggerTapVisual = useCallback((x: number, y: number) => {
    const id = ++rippleIdCounter.current;
    setTapRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => {
      setTapRipples((prev) => prev.filter((r) => r.id !== id));
    }, 280);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onMove(0, 0);
      pointersRef.current.clear();
      dragPointerIdRef.current = null;
    };
  }, [onMove]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only capture primary button / touch pointers
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Prevent default scrolling/zooming on mobile
    e.preventDefault();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore in older browsers
    }

    const state: TouchPointerState = {
      startX: e.clientX,
      startY: e.clientY,
      anchorX: e.clientX,
      anchorY: e.clientY,
      startTime: performance.now(),
      isDrag: false,
    };

    pointersRef.current.set(e.pointerId, state);

    // If we don't have an active drag pointer, this pointer could become one
    if (dragPointerIdRef.current === null) {
      dragPointerIdRef.current = e.pointerId;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ptr = pointersRef.current.get(e.pointerId);
    if (!ptr) return;

    e.preventDefault();

    const dxFromStart = e.clientX - ptr.startX;
    const dyFromStart = e.clientY - ptr.startY;
    const distFromStart = Math.hypot(dxFromStart, dyFromStart);

    // Check if movement exceeds tap threshold
    if (!ptr.isDrag && distFromStart > TAP_DISTANCE_THRESHOLD) {
      ptr.isDrag = true;
    }

    // Only update movement if this pointer is the designated drag pointer
    if (ptr.isDrag && dragPointerIdRef.current === e.pointerId) {
      let dx = e.clientX - ptr.anchorX;
      let dy = e.clientY - ptr.anchorY;
      let dist = Math.hypot(dx, dy);

      // Dynamic floating anchor: if pulled beyond max radius, slide anchor towards finger
      // This gives instantaneous direction changes (never sluggish)
      if (dist > MAX_DRAG_RADIUS) {
        const angle = Math.atan2(dy, dx);
        ptr.anchorX = e.clientX - Math.cos(angle) * MAX_DRAG_RADIUS;
        ptr.anchorY = e.clientY - Math.sin(angle) * MAX_DRAG_RADIUS;
        dx = e.clientX - ptr.anchorX;
        dy = e.clientY - ptr.anchorY;
        dist = MAX_DRAG_RADIUS;
      }

      // Calculate normalized directional input with deadzone
      if (dist < DEADZONE) {
        onMove(0, 0);
      } else {
        const activeRange = MAX_DRAG_RADIUS - DEADZONE;
        const normalizedMagnitude = Math.min(1, (dist - DEADZONE) / activeRange);
        const speed = normalizedMagnitude * sensitivity;
        const normX = (dx / dist) * speed;
        const normY = (dy / dist) * speed;

        onMove(
          Math.max(-1, Math.min(1, normX)),
          Math.max(-1, Math.min(1, normY))
        );
      }

      // Update subtle visual drag indicator
      setDragVisual({
        anchorX: ptr.anchorX,
        anchorY: ptr.anchorY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ptr = pointersRef.current.get(e.pointerId);
    if (!ptr) return;

    e.preventDefault();

    const elapsed = performance.now() - ptr.startTime;
    const finalDist = Math.hypot(e.clientX - ptr.startX, e.clientY - ptr.startY);

    // Accurate Smart Tap Detection:
    // If pointer was never marked as dragging, stayed within distance threshold,
    // and was released within the quick tap time window -> CATCH!
    if (!ptr.isDrag && finalDist <= TAP_DISTANCE_THRESHOLD && elapsed <= TAP_TIME_THRESHOLD) {
      onCatch();
      triggerTapVisual(e.clientX, e.clientY);
    }

    // If the drag pointer was released, immediately stop movement to allow deceleration
    if (dragPointerIdRef.current === e.pointerId) {
      onMove(0, 0);
      setDragVisual(null);
      dragPointerIdRef.current = null;

      // If another pointer is still pressed down and already dragging, promote it
      for (const [otherId, otherPtr] of pointersRef.current.entries()) {
        if (otherId !== e.pointerId && otherPtr.isDrag) {
          dragPointerIdRef.current = otherId;
          break;
        }
      }
    }

    pointersRef.current.delete(e.pointerId);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current === e.pointerId) {
      onMove(0, 0);
      setDragVisual(null);
      dragPointerIdRef.current = null;
    }
    pointersRef.current.delete(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="absolute inset-0 z-10 touch-none select-none overflow-hidden cursor-crosshair pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      {/* Subtle Drag Feedback: Appears only while actively moving SpongeBob */}
      {dragVisual && (
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Floating Anchor Bubble Base */}
          <div
            style={{
              left: `${dragVisual.anchorX}px`,
              top: `${dragVisual.anchorY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute w-20 h-20 rounded-full border-2 border-sky-300/40 bg-sky-500/10 backdrop-blur-[1px] animate-pulse"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Current Drag Bubble Thumb Puck */}
          <div
            style={{
              left: `${dragVisual.currentX}px`,
              top: `${dragVisual.currentY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400/80 to-cyan-300/80 border-2 border-white/80 shadow-[0_0_12px_rgba(56,189,248,0.5)] flex items-center justify-center transition-transform duration-75"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
          </div>
        </div>
      )}

      {/* Tap Bubble Burst Animation: Quick playful feedback on tap-to-catch */}
      {tapRipples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute pointer-events-none select-none flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full border-3 border-amber-300/90 bg-amber-400/20 animate-ping duration-300" />
          <span className="absolute text-xl animate-bounce">🕸️</span>
        </div>
      ))}
    </div>
  );
};
