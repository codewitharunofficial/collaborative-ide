import { io, Socket } from "socket.io-client";

type ServerToClientEvents = {
  "room-created": (roomId: string) => void;
  "room-joined": (roomId: string) => void;
  "code-update": (code: string) => void;
};

type ClientToServerEvents = {
  "create-room": (
    payload: { roomId: string },
    callback: (response: {
      success: boolean;
      roomId?: string;
      error?: string;
    }) => void
  ) => void;
  "join-room": (
    payload: { roomId: string },
    callback: (response: {
      success: boolean;
      roomId?: string;
      error?: string;
    }) => void
  ) => void;
  "code-change": (payload: { roomId: string; code: string }) => void;
  "leave-room": (payload: { roomId: string }) => void;
};

class SocketServices {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io("http://localhost:1234", { transports: ["websocket"] });
  }

  emit<Event extends keyof ClientToServerEvents>(
    event: Event,
    ...args: Parameters<ClientToServerEvents[Event]>
  ) {
    this.socket.emit(event, ...args);
  }

  on<Event extends keyof ServerToClientEvents>(
    event: Event,
    listener: ServerToClientEvents[Event]
  ) {
    this.socket.on(event, listener);
  }

  off<Event extends keyof ServerToClientEvents>(event: Event) {
    this.socket.off(event);
  }
}

export default new SocketServices();
