import { Severity, AlertStatus, AssetCriticality, AssetType } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Shield, Server, Database, Globe, Monitor, Flame,
  AlertTriangle, AlertCircle, Info
} from 'lucide-react';

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const styles = {
    critical: 'severity-critical',
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
  };

  return (
    <span className={cn('status-badge', styles[severity], className)}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: AlertStatus; className?: string }) {
  const styles = {
    new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    acknowledged: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    investigating: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    incident: 'bg-red-500/20 text-red-400 border border-red-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  };

  return (
    <span className={cn('status-badge', styles[status], className)}>
      {status}
    </span>
  );
}

export function CriticalityBadge({ criticality, className }: { criticality: AssetCriticality; className?: string }) {
  const styles = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', styles[criticality], className)}>
      {criticality}
    </span>
  );
}

export function MitreBadge({ techniqueId, techniqueName, showLink = false }: { techniqueId: string; techniqueName: string; showLink?: boolean }) {
  const mitreUrl = `https://attack.mitre.org/techniques/${techniqueId.replace('.', '/')}/`;
  return (
    <div className="flex items-center gap-2">
      {showLink ? (
        <a href={mitreUrl} target="_blank" rel="noopener noreferrer" className="mitre-badge hover:opacity-80 transition-opacity">
          {techniqueId}
        </a>
      ) : (
        <span className="mitre-badge">{techniqueId}</span>
      )}
      <span className="text-xs text-muted-foreground">{techniqueName}</span>
      {showLink && (
        <a href={mitreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
          ATT&CK ↗
        </a>
      )}
    </div>
  );
}

export function AssetTypeIcon({ type, className }: { type: AssetType; className?: string }) {
  const icons = {
    'linux-server': Server,
    'windows-server': Server,
    'web-app': Globe,
    'database': Database,
    'firewall': Shield,
    'workstation': Monitor,
  };

  const Icon = icons[type] || Server;
  return <Icon className={cn('h-4 w-4', className)} />;
}

export function SeverityIcon({ severity, className }: { severity: Severity; className?: string }) {
  const configs = {
    critical: { icon: Flame, className: 'text-red-500' },
    high: { icon: AlertTriangle, className: 'text-orange-500' },
    medium: { icon: AlertCircle, className: 'text-yellow-500' },
    low: { icon: Info, className: 'text-green-500' },
  };

  const config = configs[severity];
  const Icon = config.icon;
  return <Icon className={cn('h-4 w-4', config.className, className)} />;
}

export function ConfidenceMeter({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 75) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{confidence}%</span>
    </div>
  );
}
