import { WsStatus } from '@/hooks/useAlertsWebSocket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface Props {
  status: WsStatus;
}

export function WsStatusBadge({ status }: Props) {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-500">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="text-xs font-medium">Live</span>
        <Wifi className="h-3 w-3" />
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted border border-border text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs font-medium">Connecting…</span>
      </div>
    );
  }

  // disconnected | error
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
      <WifiOff className="h-3 w-3" />
      <span className="text-xs font-medium">
        {status === 'error' ? 'WS Error' : 'Reconnecting…'}
      </span>
    </div>
  );
}
