import { useSIEMStore } from '@/lib/siemStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from './Badges';
import { Shield, Clock, AlertTriangle, CheckCircle, Search, Archive } from 'lucide-react';
import { format } from 'date-fns';

export function IncidentsView() {
  const { incidents, alerts } = useSIEMStore();

  const statusColors = {
    open: 'bg-red-500',
    investigating: 'bg-yellow-500',
    contained: 'bg-blue-500',
    resolved: 'bg-green-500',
  };

  const statusIcons = {
    open: AlertTriangle,
    investigating: Search,
    contained: Shield,
    resolved: CheckCircle,
  };

  if (incidents.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center">
        <Archive className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Active Incidents</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Incidents will appear here when alerts are escalated.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        const relatedAlerts = alerts.filter(a => incident.alertIds.includes(a.id));
        const StatusIcon = statusIcons[incident.status];

        return (
          <Card key={incident.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusColors[incident.status]}/20`}>
                  <StatusIcon className={`h-5 w-5 ${statusColors[incident.status].replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{incident.title}</h3>
                  <p className="text-sm text-muted-foreground">{incident.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={incident.severity} />
                <span className="status-badge bg-secondary text-secondary-foreground capitalize">
                  {incident.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{incident.description}</p>

            <div className="grid grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-mono">{format(incident.createdAt, 'yyyy-MM-dd HH:mm')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated</span>
                <p className="font-mono">{format(incident.updatedAt, 'yyyy-MM-dd HH:mm')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assignee</span>
                <p>{incident.assignee}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Related Alerts</span>
                <p>{relatedAlerts.length}</p>
              </div>
            </div>

            {/* Related Alerts */}
            <div className="border-t border-border pt-4">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Related Alerts</h4>
              <div className="space-y-2">
                {relatedAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-sm flex-1">{alert.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(alert.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">Update Status</Button>
              <Button variant="outline" size="sm">Add Note</Button>
              <Button variant="outline" size="sm">View Full Timeline</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
