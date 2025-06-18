import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket:", socketRef.current.id);
      setIsReady(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  if (!isReady) return null; // wait until socket is ready

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
