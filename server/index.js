const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./db");
const Canvas = require("./models/Canvas");

const lastUpdateTimes = new Map();
const COOLDOWN_MS = 5 * 1000; // 5 seconds (changed from 5 minutes)

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let canvasData = []; // Global shared canvas data in memory

// Load or create canvas once on server startup
const loadOrCreateCanvas = async () => {
  try {
    let canvas = await Canvas.findOne({ name: "shared-canvas" });

    if (!canvas) {
      canvasData = Array(64).fill().map(() => Array(64).fill("#F0F0F0")); // Light gray instead of white
      canvas = new Canvas({ name: "shared-canvas", data: canvasData });
      await canvas.save();
      console.log("🆕 Canvas initialized and saved to DB");
    } else {
      canvasData = canvas.data;
      console.log("📤 Loaded canvas from DB");
    }
  } catch (err) {
    console.error("❌ Failed to load or create canvas:", err);
  }
};

// Load canvas from DB when server starts
connectDB().then(() => {
  loadOrCreateCanvas();

  io.on("connection", async (socket) => {
    console.log("🟢 User connected:", socket.id);

    // Send canvas data to the new client
    socket.emit("canvas-init", canvasData);

    socket.on("pixel-update", async (data) => {
      const now = Date.now();
      const last = lastUpdateTimes.get(socket.id) || 0;

      if (now - last < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
        console.log(`⛔ Rate limiting ${socket.id} for ${remaining} seconds`);
        socket.emit("rate-limit", { remaining });
        return;
      }

      lastUpdateTimes.set(socket.id, now);

      // Update canvas data
      canvasData[data.row][data.col] = data.color;
      
      try {
        await Canvas.updateOne({ name: "shared-canvas" }, { data: canvasData });
        console.log("🎯 Pixel updated and saved to DB", data);
      } catch (err) {
        console.error("❌ Failed to save canvas to DB:", err);
      }

      // Broadcast to all other clients (not the sender)
      io.emit("pixel-update", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      // Clean up the user's last update time
      lastUpdateTimes.delete(socket.id);
    });
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});