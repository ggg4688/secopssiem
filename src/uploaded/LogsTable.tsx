import { useState } from 'react';
import { useSIEMStore } from '@/lib/siemStore';
import { LogEntry, Severity } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SeverityBadge, AssetTypeIcon, CriticalityBadge } from './Badges';
import { Search, Filter, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function LogsTable() {
  const { logs } = useSIEMStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sourceIp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by message, asset, IP, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <Button
              key={sev}
              variant={severityFilter === sev ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter(sev)}
              className="text-xs"
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto scrollbar-thin">
        {filteredLogs.map((log) => (
          <LogRow
            key={log.id}
            log={log}
            isExpanded={expandedLogId === log.id}
            onToggle={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
          />
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </Card>
  );
}

function LogRow({
  log,
  isExpanded,
  onToggle,
}: {
  log: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground font-mono w-36 shrink-0">
          {format(log.timestamp, 'HH:mm:ss.SSS')}
        </span>
        <SeverityBadge severity={log.severity} className="shrink-0" />
        <div className="flex items-center gap-2 shrink-0 w-40">
          <AssetTypeIcon type={log.asset.type} className="text-muted-foreground" />
          <span className="text-sm font-mono truncate">{log.asset.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-muted rounded font-mono shrink-0">
          {log.eventType}
        </span>
        <span className="text-sm text-muted-foreground flex-1 truncate">
          {log.message}
        </span>
        {log.sourceIp && (
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {log.sourceIp}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 bg-card border-t border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DetailItem label="Timestamp" value={format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')} />
            <DetailItem label="Event Type" value={log.eventType} />
            <DetailItem label="Source IP" value={log.sourceIp || 'N/A'} />
            <DetailItem label="User" value={log.user || 'N/A'} />
          </div>
          
          <div className="mt-4 p-3 bg-secondary/50 rounded-md">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Asset Information</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem label="Asset Name" value={log.asset.name} />
              <DetailItem label="Asset Type" value={log.asset.type} />
              <DetailItem label="IP Address" value={log.asset.ip} />
              <div>
                <span className="text-xs text-muted-foreground">Criticality</span>
                <div className="mt-1">
                  <CriticalityBadge criticality={log.asset.criticality} />
                </div>
              </div>
            </div>
          </div>

          {Object.keys(log.details).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Details</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(log.details).map(([key, value]) => (
                  value && <DetailItem key={key} label={key} value={value} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground capitalize">{label}</span>
      <p className="text-sm font-mono">{value}</p>
    </div>
  );
}
