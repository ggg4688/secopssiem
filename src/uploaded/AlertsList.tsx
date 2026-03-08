import { useSIEMStore } from '@/lib/siemStore';
import { Alert, AlertStatus, Severity } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge, StatusBadge, MitreBadge, ConfidenceMeter, AssetTypeIcon, CriticalityBadge } from './Badges';
import {
  Shield, Clock, User, Globe, Server, ChevronRight,
  CheckCircle, AlertTriangle, Ban, UserX, FileText, X
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export function AlertsList() {
  const { alerts, selectedAlertId, selectAlert } = useSIEMStore();
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');

  const filteredAlerts = alerts.filter(a =>
    statusFilter === 'all' || a.status === statusFilter
  );

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Alerts List */}
      <Card className="p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Alerts</h2>
          <span className="text-sm text-muted-foreground">({filteredAlerts.length})</span>
          <div className="ml-auto flex gap-1">
            {(['all', 'new', 'investigating', 'incident', 'closed'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs"
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedAlertId === alert.id}
              onClick={() => selectAlert(alert.id)}
            />
          ))}
        </div>
      </Card>

      {/* Investigation Panel */}
      {selectedAlert ? (
        <InvestigationPanel alert={selectedAlert} onClose={() => selectAlert(null)} />
      ) : (
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Select an Alert</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Click on an alert to view investigation details,<br />timeline, and response actions.
          </p>
        </Card>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  isSelected,
  onClick,
}: {
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-primary bg-primary/10 glow-effect'
          : 'border-border bg-secondary/30 hover:bg-secondary/50'
      } ${alert.severity === 'critical' && alert.status === 'new' ? 'pulse-critical' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.status} />
        </div>
        <span className="text-xs text-muted-foreground">
          {format(alert.timestamp, 'HH:mm:ss')}
        </span>
      </div>

      <h3 className="font-medium mb-1">{alert.title}</h3>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          <Server className="h-3 w-3" />
          {alert.asset.name}
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {alert.sourceIp}
        </div>
        {alert.user && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {alert.user}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <MitreBadge techniqueId={alert.mitre.techniqueId} techniqueName={alert.mitre.techniqueName} />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function InvestigationPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const {
    acknowledgeAlert,
    escalateToIncident,
    closeAlert,
    simulateBlockIP,
    simulateDisableUser,
  } = useSIEMStore();

  return (
    <Card className="p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Investigation</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
        {/* Alert Summary */}
        <div className="siem-panel">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{alert.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            </div>
            <div className="flex gap-2">
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Event Count</span>
              <p className="font-mono font-medium">{alert.eventCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence</span>
              <ConfidenceMeter confidence={alert.confidence} />
            </div>
          </div>
        </div>

        {/* MITRE ATT&CK */}
        <div className="siem-panel">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Threat Classification</h4>
          <div className="flex items-center gap-3">
            <span className="mitre-badge text-sm">{alert.mitre.techniqueId}</span>
            <div>
              <p className="font-medium">{alert.mitre.techniqueName}</p>
              <p className="text-sm text-muted-foreground">{alert.mitre.tactic}</p>
            </div>
          </div>
        </div>

        {/* Asset Information */}
        <div className="siem-panel">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Asset Context</h4>
          <div className="flex items-center gap-3 mb-3">
            <AssetTypeIcon type={alert.asset.type} className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-mono font-medium">{alert.asset.name}</p>
              <p className="text-sm text-muted-foreground">{alert.asset.ip}</p>
            </div>
            <CriticalityBadge criticality={alert.asset.criticality} className="ml-auto" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="capitalize">{alert.asset.type.replace('-', ' ')}</p>
            </div>
            {alert.asset.os && (
              <div>
                <span className="text-muted-foreground">OS</span>
                <p>{alert.asset.os}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attack Timeline */}
        <div className="siem-panel">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Attack Timeline</h4>
          <div className="space-y-0">
            {alert.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    event.type === 'alert' ? 'bg-red-500 border-red-500' :
                    event.type === 'action' ? 'bg-green-500 border-green-500' :
                    event.type === 'threshold' ? 'bg-yellow-500 border-yellow-500' :
                    'bg-background border-primary'
                  }`} />
                  {index < alert.timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.timestamp, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Actions */}
        <div className="siem-panel">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Response Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateBlockIP(alert.id)}
              className="justify-start"
            >
              <Ban className="h-4 w-4 mr-2" />
              Block IP
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateDisableUser(alert.id)}
              className="justify-start"
              disabled={!alert.user}
            >
              <UserX className="h-4 w-4 mr-2" />
              Disable User
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Shield className="h-4 w-4 mr-2" />
              Run Playbook
            </Button>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="pt-4 border-t border-border mt-4 flex gap-2">
        {alert.status === 'new' && (
          <Button onClick={() => acknowledgeAlert(alert.id)} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Acknowledge
          </Button>
        )}
        {(alert.status === 'new' || alert.status === 'investigating') && (
          <Button
            variant="destructive"
            onClick={() => escalateToIncident(alert.id)}
            className="flex-1"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate
          </Button>
        )}
        {alert.status !== 'closed' && (
          <Button
            variant="outline"
            onClick={() => closeAlert(alert.id, 'False positive')}
            className="flex-1"
          >
            Close
          </Button>
        )}
      </div>
    </Card>
  );
}
