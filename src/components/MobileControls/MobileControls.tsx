import React, { useRef, useState, useCallback, useEffect } from 'react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onCatch: () => void;
  size?: 'small' | 'medium' | 'large';
  sensitivity?: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onCatch,
  size = 'medium',
  sensitivity = 1.0,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCatchPressed, setIsCatchPressed] = useState(false);
  const pointerIdRef = useRef<number | null>(null);

  const baseRadius = size === 'small' ? 50 : size === 'large' ? 70 : 60;
  const knobRadius = size === 'small' ? 22 : size === 'large' ? 30 : 26;
  const catchBtnSize = size === 'small' ? 70 : size === 'large' ? 94 : 82;

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
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-30 p-4 sm:p-6 flex items-end justify-between select-none">
      {/* Virtual Joystick (Bottom Left) */}
      <div
        ref={joystickBaseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: baseRadius * 2,
          height: baseRadius * 2,
        }}
        className={`pointer-events-auto rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-2xl relative flex items-center justify-center touch-none transition-transform ${
          isDragging ? 'scale-105 border-sky-400/60' : 'opacity-85'
        }`}
      >
        {/* Direction Guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-[1px] bg-white" />
          <div className="h-full w-[1px] bg-white absolute" />
        </div>

        {/* Inner Knob */}
        <div
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
          }}
          className={`rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-md border-2 border-white pointer-events-none transition-all duration-75 ${
            isDragging ? 'scale-110 shadow-sky-500/50' : ''
          }`}
        />
      </div>

      {/* Catch Action Button (Bottom Right) */}
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
          width: catchBtnSize,
          height: catchBtnSize,
        }}
        aria-label="Catch Jellyfish"
        className={`pointer-events-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-4 border-white/90 shadow-2xl text-slate-900 flex flex-col items-center justify-center font-cartoon font-extrabold active:scale-95 transition-all touch-none select-none ${
          isCatchPressed
            ? 'scale-90 brightness-90 shadow-inner'
            : 'hover:scale-105 shadow-amber-500/40'
        }`}
      >
        <span className="text-xl sm:text-2xl leading-none">🕸️</span>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900">
          Catch
        </span>
      </button>
    </div>
  );
};
