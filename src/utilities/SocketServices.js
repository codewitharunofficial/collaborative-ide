import { io } from "socket.io-client";

const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1234";

// create socket connection
const socket = io(appUrl, {
  transports: ["websocket"],
  reconnection: true,
});

class SocketService {
  constructor() {
    this.socket = socket;
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  emit(event, data, callback) {
    this.socket.emit(event, data, callback);
  }

  off(event){
    this.socket.off(event)
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default new SocketService();
