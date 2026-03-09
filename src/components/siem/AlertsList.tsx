import { useSIEMStore } from '@/lib/siemStore';
import { Alert, AlertStatus, Severity } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SeverityBadge, StatusBadge, MitreBadge, ConfidenceMeter, AssetTypeIcon, CriticalityBadge } from './Badges';
import {
  Shield, Clock, User, Globe, Server, ChevronRight,
  CheckCircle, AlertTriangle, Ban, UserX, FileText, X, Search, Filter, Play
} from 'lucide-react';
import { format, subHours, subDays, isAfter } from 'date-fns';
import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { CreateTicketModal } from './CreateTicketModal';
import { RunPlaybookModal } from './RunPlaybookModal';

type TimeRange = '1h' | '24h' | '7d' | 'all';

export function AlertsList() {
  const { alerts, selectedAlertId, selectAlert } = useSIEMStore();
  
  // Filter states
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [mitreFilter, setMitreFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Get unique values for filters
  const uniqueAssets = useMemo(() => 
    [...new Set(alerts.map(a => a.asset.name))].sort(), 
    [alerts]
  );
  
  const uniqueMitreTechniques = useMemo(() => 
    [...new Map(alerts.map(a => [a.mitre.techniqueId, a.mitre])).values()].sort((a, b) => a.techniqueId.localeCompare(b.techniqueId)),
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    const now = new Date();
    let timeThreshold: Date | null = null;
    
    if (timeRange === '1h') timeThreshold = subHours(now, 1);
    else if (timeRange === '24h') timeThreshold = subHours(now, 24);
    else if (timeRange === '7d') timeThreshold = subDays(now, 7);

    return alerts.filter(a => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (assetFilter !== 'all' && a.asset.name !== assetFilter) return false;
      if (mitreFilter !== 'all' && a.mitre.techniqueId !== mitreFilter) return false;
      if (timeThreshold && !isAfter(a.timestamp, timeThreshold)) return false;
      return true;
    });
  }, [alerts, severityFilter, statusFilter, assetFilter, mitreFilter, timeRange]);

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  const clearFilters = () => {
    setSeverityFilter('all');
    setStatusFilter('all');
    setAssetFilter('all');
    setMitreFilter('all');
    setTimeRange('all');
  };

  const hasActiveFilters = severityFilter !== 'all' || statusFilter !== 'all' || assetFilter !== 'all' || mitreFilter !== 'all' || timeRange !== 'all';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Alerts List */}
      <Card className="p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Alerts</h2>
          <span className="text-sm text-muted-foreground">({filteredAlerts.length})</span>
        </div>

        {/* Filter Controls */}
        <div className="siem-panel mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs h-6">
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as Severity | 'all')}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AlertStatus | 'all')}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Asset Filter */}
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                {uniqueAssets.map(asset => (
                  <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* MITRE Technique Filter */}
            <Select value={mitreFilter} onValueChange={setMitreFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="MITRE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Techniques</SelectItem>
                {uniqueMitreTechniques.map(mitre => (
                  <SelectItem key={mitre.techniqueId} value={mitre.techniqueId}>
                    {mitre.techniqueId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Range Filter */}
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1h">Last 1 hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts match the current filters</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlertId === alert.id}
                onClick={() => selectAlert(alert.id)}
              />
            ))
          )}
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
        <div className="flex items-center gap-3">
          <MitreBadge techniqueId={alert.mitre.techniqueId} techniqueName={alert.mitre.techniqueName} />
          <span className="text-xs text-muted-foreground font-mono">{alert.confidence}%</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function InvestigationPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const {
    acknowledgeAlert,
    updateAlertStatus,
    escalateToIncident,
    closeAlert,
    addTimelineEvent,
  } = useSIEMStore();

  const [ticketOpen, setTicketOpen] = useState(false);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [blockingIP, setBlockingIP] = useState(false);
  const [disablingUser, setDisablingUser] = useState(false);

  const handleBlockIP = async () => {
    setBlockingIP(true);
    try {
      await api.post('/api/actions/block-ip', { ip: alert.sourceIp });
      toast({ title: 'IP blocked' });
      addTimelineEvent(alert.id, 'IP blocked by analyst');
    } catch {
      toast({ title: 'Failed to block IP', variant: 'destructive' });
    } finally {
      setBlockingIP(false);
    }
  };

  const handleDisableUser = async () => {
    if (!alert.user) return;
    setDisablingUser(true);
    try {
      await api.post('/api/actions/disable-user', { username: alert.user });
      toast({ title: 'User disabled' });
      addTimelineEvent(alert.id, 'User account disabled');
    } catch {
      toast({ title: 'Failed to disable user', variant: 'destructive' });
    } finally {
      setDisablingUser(false);
    }
  };

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
            <MitreBadge techniqueId={alert.mitre.techniqueId} techniqueName={alert.mitre.techniqueName} showLink />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.mitre.tactic}</p>
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
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Investigation Timeline</h4>
          <div className="space-y-0">
            {alert.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    event.type === 'alert' ? 'bg-destructive border-destructive' :
                    event.type === 'action' ? 'bg-green-500 border-green-500' :
                    event.type === 'threshold' ? 'bg-yellow-500 border-yellow-500' :
                    'bg-primary/50 border-primary'
                  }`} />
                  {index < alert.timeline.length - 1 && (
                    <div className="w-0.5 h-10 bg-border" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{event.description}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      event.type === 'alert' ? 'bg-destructive/20 text-destructive' :
                      event.type === 'action' ? 'bg-green-500/20 text-green-400' :
                      event.type === 'threshold' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(event.timestamp, 'HH:mm:ss')}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      {alert.asset.name}
                    </span>
                  </div>
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
              onClick={handleBlockIP}
              disabled={blockingIP}
              className="justify-start"
            >
              <Ban className="h-4 w-4 mr-2" />
              {blockingIP ? 'Blocking…' : 'Block IP'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisableUser}
              disabled={!alert.user || disablingUser}
              className="justify-start"
            >
              <UserX className="h-4 w-4 mr-2" />
              {disablingUser ? 'Disabling…' : 'Disable User'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTicketOpen(true)}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaybookOpen(true)}
              className="justify-start"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Playbook
            </Button>
            {alert.status !== 'closed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => closeAlert(alert.id, 'False positive')}
                className="justify-start col-span-2 sm:col-span-1"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
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
        {alert.status === 'acknowledged' && (
          <Button onClick={() => updateAlertStatus(alert.id, 'investigating')} className="flex-1" variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Investigate
          </Button>
        )}
        {(alert.status === 'new' || alert.status === 'acknowledged' || alert.status === 'investigating') && (
          <Button
            variant="destructive"
            onClick={() => escalateToIncident(alert.id)}
            className="flex-1"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate
          </Button>
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        alertId={alert.id}
        defaultAsset={alert.asset.name}
        defaultTitle={`Incident: ${alert.title}`}
        defaultSeverity={alert.severity}
        onSuccess={() => addTimelineEvent(alert.id, 'Incident ticket created by analyst')}
      />
      <RunPlaybookModal
        open={playbookOpen}
        onClose={() => setPlaybookOpen(false)}
        alertId={alert.id}
        onSuccess={() => addTimelineEvent(alert.id, 'Playbook executed')}
      />
    </Card>
  );
}
