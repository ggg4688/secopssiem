import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Clock, User, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface TimelineEntry {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  analyst?: string;
}

interface IncidentTimelineModalProps {
  open: boolean;
  onClose: () => void;
  incidentId: string;
}

export function IncidentTimelineModal({ open, onClose, incidentId }: IncidentTimelineModalProps) {
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<TimelineEntry[]>(`/api/incidents/${incidentId}/timeline`)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [open, incidentId]);

  const typeColor = (t: string) => {
    switch (t) {
      case 'alert': return 'bg-destructive/20 text-destructive';
      case 'action': return 'bg-green-500/20 text-green-400';
      case 'status_change': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Full Investigation Timeline</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-0 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No timeline events found.</p>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    event.eventType === 'alert' ? 'bg-destructive border-destructive' :
                    event.eventType === 'action' ? 'bg-green-500 border-green-500' :
                    'bg-primary/50 border-primary'
                  }`} />
                  {index < events.length - 1 && <div className="w-0.5 h-10 bg-border" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{event.description}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${typeColor(event.eventType)}`}>
                      {event.eventType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(() => { try { return format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'); } catch { return event.timestamp; } })()}
                    </span>
                    {event.analyst && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.analyst}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
