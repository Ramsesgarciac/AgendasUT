import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // Handle incoming messages
          if (message.type === 'STATUS_UPDATE') {
            // Dispatch custom event for components to listen
            window.dispatchEvent(new CustomEvent('wsStatusUpdate', { detail: message }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Only attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        } else {
          console.warn('Max WebSocket reconnection attempts reached. Real-time updates disabled.');
        }
      };

      ws.current.onerror = (error) => {
        console.warn('WebSocket connection failed. Real-time updates will not work until server is available.');
        // Let onclose handle reconnection
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection. Real-time updates disabled:', error instanceof Error ? error.message : String(error));
    }
  }, [url]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { sendMessage, disconnect };
};