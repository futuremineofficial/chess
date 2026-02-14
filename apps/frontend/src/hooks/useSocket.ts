import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@repo/store/useUser';

const WS_URL = import.meta.env.VITE_APP_WS_URL ?? 'ws://localhost:8080';
const MAX_RETRIES = 5;
const CONNECTION_TIMEOUT_MS = 5000;

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = useUser();
  const retriesRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!user || !mountedRef.current) return;
    if (retriesRef.current >= MAX_RETRIES) {
      console.error('Max WebSocket connection retries reached');
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${user.token}`);
    wsRef.current = ws;

    // Timeout: if connection doesn't open within 5s, close and retry
    timeoutRef.current = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn(`WebSocket connection attempt ${retriesRef.current + 1} timed out, retrying...`);
        ws.close();
      }
    }, CONNECTION_TIMEOUT_MS);

    ws.onopen = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      retriesRef.current = 0;
      if (mountedRef.current) setSocket(ws);
    };

    ws.onclose = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (mountedRef.current) {
        setSocket(null);
        retriesRef.current++;
        // Retry with backoff
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current - 1), 8000);
        setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror, retry handled there
    };
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    retriesRef.current = 0;
    connect();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return socket;
};
