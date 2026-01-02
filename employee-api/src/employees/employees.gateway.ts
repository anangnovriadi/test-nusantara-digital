import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EmployeeGateway {
  @WebSocketServer()
  server: Server;

  emitProgress(jobId: string, progress: number) {
    console.log('[Gateway] 📡 Emitting progress:', { jobId, progress });
    this.server.emit('importProgress', { jobId, progress });
  }
}
