import { Server, Socket } from 'socket.io';

// we will use this property to listen for events outside this class
let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Post socket io handler listening');
    });
  }
}
