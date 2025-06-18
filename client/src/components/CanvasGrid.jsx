import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSocket } from "../context/SocketContext";

export default function CanvasGrid({ pixels, handlePixelClick, updatePixel, selectedColor }) {
  const gridSize = 64;
  const socket = useSocket();
  const [cooldown, setCooldown] = useState(0);

  // Handle click on a pixel (local user)
  const onPixelClick = (row, col) => {
    if (cooldown > 0) {
      alert(`⏱️ You can draw again in ${cooldown} seconds`);
      return;
    }

    socket.emit("try-pixel-update", { row, col, color: selectedColor });
  };

  useEffect(() => {
    if (!socket) return;

    const handleRateLimit = ({ remaining }) => {
      console.warn("⛔ Rate limited for", remaining, "seconds");
      setCooldown(remaining); // start countdown
    };

    socket.on("rate-limit", handleRateLimit);

    return () => {
      socket.off("rate-limit", handleRateLimit);
    };
  }, [socket]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    if (!socket) return;

    // Handle receiving pixel update from other users
    const handleIncomingPixel = ({ row, col, color }) => {
      console.log("⬇️ Received pixel-update", row, col, color);
      updatePixel(row, col, color);
    };

    socket.on("pixel-update", handleIncomingPixel);

    return () => {
      socket.off("pixel-update", handleIncomingPixel);
    };
  }, [socket, updatePixel]);

  

  return (
    <div>
      {cooldown > 0 && (
        <div className="text-red-400 mb-2 font-mono">
          ⏳ Wait {cooldown} seconds before drawing again
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 16px)`,
          gridTemplateRows: `repeat(${gridSize}, 16px)`,
          width: `${gridSize * 16}px`,
          height: `${gridSize * 16}px`,
          border: "2px solid #ccc",
          gap: "0px",
          pointerEvents: cooldown > 0 ? "none" : "auto", // disables grid during cooldown
        }}
      >
        {pixels.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="border border-gray-300"
              style={{
                backgroundColor: color,
                width: "16px",
                height: "16px",
                cursor: cooldown > 0 ? "not-allowed" : "pointer",
              }}
              onClick={() => onPixelClick(rowIndex, colIndex)}
              role="button"
              tabIndex={0}
              aria-label={`Pixel at row ${rowIndex + 1}, column ${colIndex + 1}`}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  onPixelClick(rowIndex, colIndex);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

CanvasGrid.propTypes = {
  pixels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  handlePixelClick: PropTypes.func.isRequired,
  updatePixel: PropTypes.func.isRequired,
  selectedColor: PropTypes.string.isRequired,
};