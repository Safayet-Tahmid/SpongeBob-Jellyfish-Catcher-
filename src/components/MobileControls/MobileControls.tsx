import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CustomControlLayout } from '../../types/game';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onCatch: () => void;
  layout?: CustomControlLayout;
  sensitivity?: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onCatch,
  layout,
  sensitivity = 1.0,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCatchPressed, setIsCatchPressed] = useState(false);
  const pointerIdRef = useRef<number | null>(null);

  // Scaled dimensions from layout
  const joystickScale = layout?.joystickScale || 1.15;
  const catchBtnScale = layout?.catchBtnScale || 1.25;
  const opacity = layout?.opacity ?? 0.9;

  const baseRadius = 64 * joystickScale;
  const knobRadius = 28 * joystickScale;
  const catchBtnSize = 88 * catchBtnScale;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pointerIdRef.current !== null) return;

    pointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    pointerIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const updateKnob = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > baseRadius) {
        dx = (dx / dist) * baseRadius;
        dy = (dy / dist) * baseRadius;
      }

      setKnobPos({ x: dx, y: dy });

      const normX = (dx / baseRadius) * sensitivity;
      const normY = (dy / baseRadius) * sensitivity;
      onMove(normX, normY);
    },
    [baseRadius, onMove, sensitivity]
  );

  useEffect(() => {
    return () => {
      onMove(0, 0);
    };
  }, [onMove]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Virtual Joystick (Positioned via Custom Layout or Default) */}
      <div
        ref={joystickBaseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          left: `${layout?.joystickX ?? 20}px`,
          bottom: `${layout?.joystickY ?? 20}px`,
          width: baseRadius * 2,
          height: baseRadius * 2,
          opacity,
        }}
        className={`pointer-events-auto absolute rounded-full bg-slate-950/75 border-4 border-amber-400 shadow-2xl flex items-center justify-center touch-none transition-transform ${
          isDragging ? 'scale-105 border-amber-300 ring-4 ring-amber-400/40' : ''
        }`}
      >
        {/* Direction Guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-full h-1 bg-amber-400/50" />
          <div className="h-full w-1 bg-amber-400/50 absolute" />
        </div>

        {/* Inner Knob (2000s Cartoon Arcade Puck) */}
        <div
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
          }}
          className={`rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-sky-700 border-3 border-white shadow-lg pointer-events-none transition-transform duration-75 flex items-center justify-center ${
            isDragging ? 'scale-110 shadow-sky-500/60' : ''
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Catch Action Button (Positioned via Custom Layout or Default) */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          setIsCatchPressed(true);
          onCatch();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          setIsCatchPressed(false);
        }}
        onPointerCancel={() => setIsCatchPressed(false)}
        style={{
          right: `${layout?.catchBtnX ?? 20}px`,
          bottom: `${layout?.catchBtnY ?? 20}px`,
          width: catchBtnSize,
          height: catchBtnSize,
          opacity,
        }}
        aria-label="Catch Jellyfish"
        className={`pointer-events-auto absolute rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 border-4 border-white shadow-2xl text-slate-950 flex flex-col items-center justify-center font-cartoon font-black transition-all touch-none select-none active:scale-90 ${
          isCatchPressed
            ? 'translate-y-1 brightness-90 shadow-inner'
            : 'border-b-6 border-amber-600 hover:scale-105 shadow-amber-500/50'
        }`}
      >
        <span className="text-2xl sm:text-3xl leading-none drop-shadow">🕸️</span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 drop-shadow-sm -mt-0.5">
          Catch!
        </span>
      </button>
    </div>
  );
};
