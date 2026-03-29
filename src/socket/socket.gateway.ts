import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { SocketService } from "./socket.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    transports: ['websocket', 'polling'], 
    // port: 3001,  // keeping my default
})
export class SocketGateway implements OnGatewayConnection {

    @WebSocketServer()
     server: Server;
    constructor (private readonly socketService: SocketService){}
    handleConnection(socket : Socket) {
        this.socketService.handleConnection(socket);
    }
}