import { useEffect, useRef, useState, useCallback } from 'react';
import { useSIEMStore } from '@/lib/siemStore';
import { getToken } from '@/lib/api';

const WS_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000')
    .replace(/^http/, 'ws');

const WS_URL = `${WS_BASE_URL}/ws/alerts`;

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useAlertsWebSocket() {
  const [status, setStatus] = useState<WsStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  const addAlert = useSIEMStore((state) => state.addAlert);

  const connect = useCallback(() => {
    if (unmounted.current) return;

    // Append token as query param so the backend can authenticate the WS
    const token = getToken();
    const url = token ? `${WS_URL}?token=${token}` : WS_URL;

    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmounted.current) { ws.close(); return; }
      reconnectAttempts.current = 0;
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data as string);

        // Normalise dates that arrive as ISO strings
        const alert = {
          ...raw,
          timestamp: raw.timestamp ? new Date(raw.timestamp as string) : new Date(),
          updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string) : undefined,
          acknowledgedAt: raw.acknowledgedAt
            ? new Date(raw.acknowledgedAt as string)
            : undefined,
          closedAt: raw.closedAt ? new Date(raw.closedAt as string) : undefined,
          timeline: Array.isArray(raw.timeline)
            ? raw.timeline.map((e: { timestamp: string; [k: string]: unknown }) => ({
                ...e,
                timestamp: new Date(e.timestamp),
              }))
            : [],
          // ensure asset is at least a minimal object
          asset: raw.asset ?? { id: 'unknown', name: 'Unknown', ip: '0.0.0.0', type: 'linux-server', criticality: 'low' },
        };

        addAlert(alert);
      } catch {
        // Silently ignore malformed frames
      }
    };

    ws.onerror = () => {
      if (unmounted.current) return;
      setStatus('error');
    };

    ws.onclose = () => {
      if (unmounted.current) return;
      setStatus('disconnected');

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }, [addAlert]);

  useEffect(() => {
    unmounted.current = false;
    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
}
