import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export async function GET(request: NextRequest) {
  // Initialize WebSocket server if not already done
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 }); // Use a port, or integrate with Next.js

    wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');
      clients.add(ws);

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', data);

          // Broadcast to all other clients
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      });
    });

    console.log('WebSocket server started on port 8080');
  }

  // For HTTP requests, return a simple response
  return new Response('WebSocket server is running', { status: 200 });
}