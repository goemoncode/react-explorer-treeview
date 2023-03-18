import React from 'react';

interface ChevronProps extends Omit<React.SVGAttributes<SVGElement>, 'xmlns'> {
  dir: 'right' | 'down';
}

export function Chevron({ dir, stroke = 'currentColor', ...props }: ChevronProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} {...props}>
      {dir === 'right' && <polyline points="9 18 15 12 9 6"></polyline>}
      {dir === 'down' && <polyline points="9 18 15 12 9 6" transform="rotate(90 12 12)"></polyline>}
    </svg>
  );
}
