import React
 from "react";
export default function TopBar() {
  return (
    <div className="w-full py-4 px-6 bg-gray-800 text-white flex justify-between items-center shadow">
      <h1 className="text-2xl font-bold">🎨 Pixel Art Collab</h1>
      <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm">
        Export PNG (coming soon)
      </button>
    </div>
  );
}
