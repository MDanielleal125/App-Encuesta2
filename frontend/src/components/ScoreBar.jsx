import { useState } from 'react';

const LABELS = [
  { min: 1, max: 4, text: 'Para nada parecido a mí', color: 'bg-amber-200' },
  { min: 5, max: 5, text: 'Neutral', color: 'bg-slate-200' },
  { min: 6, max: 7, text: 'Parecido a mí', color: 'bg-sky-200' },
  { min: 8, max: 10, text: 'Muy parecido a mí', color: 'bg-emerald-300' },
];

export default function ScoreBar({ value, onChange }) {
  const [hover, setHover] = useState(null);
  const score = value ?? 0;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span key={n} className="w-[10%] text-center">
            {n}
          </span>
        ))}
      </div>
      <div className="flex gap-0.5 h-10 rounded-lg overflow-hidden bg-slate-100">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const isSelected = score === n;
          const isHover = hover === n;
          const segment = LABELS.find((l) => n >= l.min && n <= l.max);
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(n)}
              className={`flex-1 transition-all duration-150 rounded-sm ${segment?.color || 'bg-slate-200'} ${
                isSelected ? 'ring-2 ring-primary-600 ring-offset-1 scale-105' : ''
              } ${isHover && !isSelected ? 'opacity-90 scale-105' : ''}`}
              title={`Puntuación ${n}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
        {LABELS.map((l) => (
          <span key={l.text} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${l.color}`} />
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}
