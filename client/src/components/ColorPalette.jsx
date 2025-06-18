import React from "react";

const colors = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#808080", "#a52a2a"
];

export default function ColorPalette({ selectedColor, setSelectedColor }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {colors.map((color) => (
        <div
          key={color}
          className={`w-8 h-8 border-2 ${selectedColor === color ? 'border-white' : 'border-gray-500'} cursor-pointer`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
        />
      ))}
    </div>
  );
}
