import { io } from "socket.io-client";

const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1234";

const socket = io(appUrl);


class SocketService {
    constructor() {
        this.socket = socket;
    }

    on(event, callback) {
        this.socket.on(event, callback);
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

export default new SocketService();
