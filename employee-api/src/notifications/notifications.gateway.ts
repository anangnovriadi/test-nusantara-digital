import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'notifications',  // Add namespace to prevent conflict
  cors: { origin: '*' },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(payload: any) {
    this.server.emit('notification', payload);
  }
}
