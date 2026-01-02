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

  emitCompletion(jobId: string, totalProcessed: number) {
    console.log('[Gateway] ✅ Emitting completion:', { jobId, totalProcessed });
    this.server.emit('importCompleted', { jobId, totalProcessed });
  }

  emitError(jobId: string, message: string) {
    console.log('[Gateway] ❌ Emitting error:', { jobId, message });
    this.server.emit('importError', { jobId, message });
  }
}
