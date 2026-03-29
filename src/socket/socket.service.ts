
import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class SocketService {

    private readonly logger = new Logger(SocketService.name);
    private readonly connections: Map<string, any> = new Map();

    constructor(private readonly jwtService: JwtService) {}

    handleConnection (client: Socket) {
        this.logger.log(`New connection attempt from client: ${client.id}`);
        
        const authHeader = client.handshake.headers.authorization;
        
        if (!authHeader) {
            this.logger.warn(`Client ${client.id}: No authorization header provided`);
            client.emit('error', {
                status: 401,
                success: false,
                message: 'Token is required'
            });

            client.disconnect();
            this.logger.warn('Client disconnected due to missing token');
            return;
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        let user: any;
        try {
            user = this.jwtService.verify(token);
            this.logger.log(`User ID: ${user?.id} Email: ${user?.email} is connected at ${new Date().toLocaleString()}`);

            client.emit('authenticated', {
                status: 200,
                success: true,
                message: 'Connected successfully'
            });
            
        } catch (error) {
            this.logger.error(`Client ${client.id}: Token verification failed: ${error.message}`);
            client.emit('authentication_error', {
                status: 401,
                success: false,
                message: 'Unauthorized: Invalid token or expired'
            });
            return;
        }
        
        this.connections.set(client.id, client);
        this.logger.log(`Client ${client.id} successfully added to connections map`);
        
        client.on('disconnect', (reason) => {
            this.connections.delete(client.id);
            this.logger.warn(`User ID: ${user?.id} Email: ${user?.email} disconnected at ${new Date().toLocaleString()}. Reason: ${reason}`);
        });

        
    }
}