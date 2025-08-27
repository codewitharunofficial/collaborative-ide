import { io } from "socket.io-client";


const socket = io(process.env.NEXT_APP_PUBLIC_URL);


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
