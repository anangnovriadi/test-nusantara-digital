import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000");

export function useNotifications() {
  useEffect(() => {
    const handleNotification = (payload: any) => {
      console.log("Received notification", payload);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  const waitForNotification = (type: string, id: string) => {
    return new Promise<void>((resolve) => {
      const handler = (payload: any) => {
        if (payload.type === type && payload.employeeId === id) {
          resolve();
          socket.off("notification", handler);
        }
      };
      socket.on("notification", handler);
    });
  };

  return { waitForNotification };
}
