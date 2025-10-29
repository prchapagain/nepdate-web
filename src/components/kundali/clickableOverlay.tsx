import React from "react";

interface OverlayProps {
  cx: number;
  cy: number;
  onSelect: (house: number) => void;
}

const ClickableOverlay: React.FC<OverlayProps> = ({ cx, cy, onSelect }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 400"
    >
      <defs>
        {/* One lotus petal shape, centered at (200,200) */}
        <path
          id="lotus-petal"
          d="M 200 200
             C 150 150, 150 50, 200 0
             C 250 50, 250 150, 200 200 Z"
        />
      </defs>

      {Array.from({ length: 12 }, (_, i) => (
        <use
          key={i}
          href="#lotus-petal"
          fill="transparent"
          className="overlay-wedge"
          style={{ cursor: "pointer", pointerEvents: "auto" }}
          transform={`rotate(${-i * 30 - 90}, ${cx}, ${cy})`}
          onClick={() => onSelect(i + 1)}
        />
      ))}
    </svg>
  );
};

export default ClickableOverlay;
