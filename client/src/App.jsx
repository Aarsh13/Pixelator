import React, { useEffect, useState } from "react";
import ColorPalette from "./components/ColorPalette.JSX";
import CanvasGrid from "./components/CanvasGrid";
import TopBar from "./components/Topbar";
import { useSocket } from "./context/SocketContext";

export default function App() {
  const gridSize = 32;
  const socket = useSocket();
  const [selectedColor, setSelectedColor] = useState("#000000");

  const [pixels, setPixels] = useState(
    Array(gridSize)
      .fill()
      .map(() => Array(gridSize).fill("#ffffff"))
  );

  // Local pixel update on click
  const handlePixelClick = (row, col) => {
    const updatedPixels = [...pixels];
    updatedPixels[row][col] = selectedColor;
    setPixels(updatedPixels);
  };

  // Remote pixel update from socket
  const updatePixel = (row, col, color) => {
    setPixels((prev) => {
      const copy = prev.map((inner) => [...inner]);
      copy[row][col] = color;
      return copy;
    });
  };

  // Load initial canvas from server
  useEffect(() => {
    if (!socket) return;

    socket.on("canvas-init", (initialData) => {
      console.log("📥 Received initial canvas data");
      setPixels(initialData);
    });

    return () => {
      socket.off("canvas-init");
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold mb-4">🎨 Pixel Art Collab</h1>
      <TopBar />
      <ColorPalette selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
      <CanvasGrid
        pixels={pixels}
        handlePixelClick={handlePixelClick}
        updatePixel={updatePixel}
        selectedColor={selectedColor}
      />
    </div>
  );
}
