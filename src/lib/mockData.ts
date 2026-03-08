// Types
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'investigating' | 'incident' | 'closed';
export type AssetCriticality = 'high' | 'medium' | 'low';
export type AssetType = 'linux-server' | 'windows-server' | 'web-app' | 'database' | 'firewall' | 'workstation';

export interface Asset {
  id: string;
  name: string;
  ip: string;
  type: AssetType;
  criticality: AssetCriticality;
  os?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  description: string;
  type: 'alert' | 'action' | 'threshold' | 'detection';
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  timestamp: Date;
  sourceIp: string;
  user?: string;
  asset: Asset;
  mitre: {
    techniqueId: string;
    techniqueName: string;
    tactic: string;
  };
  eventCount: number;
  confidence: number;
  timeline: TimelineEvent[];
  acknowledgedAt?: Date;
  assignee?: string;
  closedAt?: Date;
  updatedAt?: Date;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  severity: Severity;
  message: string;
  asset: Asset;
  sourceIp?: string;
  user?: string;
  eventType: string;
  details: Record<string, string>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  alertIds: string[];
  assignee: string;
}

export interface SOCMetrics {
  alertsBySeverity: { critical: number; high: number; medium: number; low: number };
  mttd: number;
  mttr: number;
  incidentsToday: number;
  alertsTrend: { hour: string; count: number }[];
  topAttackedAssets: { asset: Asset; alertCount: number }[];
}

// Sample data
const assets: Asset[] = [
  { id: 'a1', name: 'web-prod-01', ip: '10.0.1.10', type: 'web-app', criticality: 'high', os: 'Ubuntu 22.04' },
  { id: 'a2', name: 'db-prod-01', ip: '10.0.2.20', type: 'database', criticality: 'high', os: 'CentOS 8' },
  { id: 'a3', name: 'fw-edge-01', ip: '10.0.0.1', type: 'firewall', criticality: 'high' },
  { id: 'a4', name: 'ws-fin-042', ip: '10.0.3.42', type: 'workstation', criticality: 'medium', os: 'Windows 11' },
  { id: 'a5', name: 'srv-dc-01', ip: '10.0.1.5', type: 'windows-server', criticality: 'high', os: 'Windows Server 2022' },
  { id: 'a6', name: 'srv-app-03', ip: '10.0.1.30', type: 'linux-server', criticality: 'medium', os: 'RHEL 9' },
];

const mitreData = [
  { techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
  { techniqueId: 'T1078', techniqueName: 'Valid Accounts', tactic: 'Persistence' },
  { techniqueId: 'T1110', techniqueName: 'Brute Force', tactic: 'Credential Access' },
  { techniqueId: 'T1059', techniqueName: 'Command and Scripting Interpreter', tactic: 'Execution' },
  { techniqueId: 'T1048', techniqueName: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration' },
  { techniqueId: 'T1071', techniqueName: 'Application Layer Protocol', tactic: 'Command and Control' },
  { techniqueId: 'T1021', techniqueName: 'Remote Services', tactic: 'Lateral Movement' },
  { techniqueId: 'T1486', techniqueName: 'Data Encrypted for Impact', tactic: 'Impact' },
];

const severities: Severity[] = ['critical', 'high', 'medium', 'low'];
const alertStatuses: AlertStatus[] = ['new', 'investigating', 'incident', 'closed'];
const users = ['jdoe', 'asmith', 'mgarcia', 'tkumar', 'lchen', undefined];
const eventTypes = ['authentication', 'network', 'file-access', 'process', 'dns', 'firewall', 'ids'];
const sourceIps = ['203.0.113.42', '198.51.100.17', '192.0.2.88', '45.33.32.156', '185.220.101.1', '91.121.87.10'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(hoursBack = 24): Date {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * hoursBack * 60 * 60 * 1000);
}

const alertTitles: Record<Severity, string[]> = {
  critical: [
    'Ransomware Activity Detected',
    'Active Data Exfiltration',
    'Domain Admin Compromise',
    'Critical SQL Injection Attack',
  ],
  high: [
    'Suspicious Lateral Movement',
    'Brute Force Attack Detected',
    'Malicious PowerShell Execution',
    'Unauthorized Database Access',
  ],
  medium: [
    'Multiple Failed Login Attempts',
    'Unusual Outbound Traffic',
    'Policy Violation - USB Device',
    'Suspicious DNS Queries',
  ],
  low: [
    'Port Scan Detected',
    'New Service Installed',
    'Scheduled Task Created',
    'Account Lockout',
  ],
};

function generateTimeline(count: number): TimelineEvent[] {
  const types: TimelineEvent['type'][] = ['detection', 'alert', 'threshold', 'action'];
  const descriptions = [
    'Initial detection by IDS rule',
    'Alert triggered by correlation engine',
    'Threshold exceeded: 50 events in 5 minutes',
    'Automated containment action initiated',
    'Analyst investigation started',
    'Additional IOCs identified',
    'Threat intelligence match found',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `tl-${Date.now()}-${i}`,
    timestamp: randomDate(2),
    description: descriptions[i % descriptions.length],
    type: types[i % types.length],
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function generateAlerts(count: number): Alert[] {
  return Array.from({ length: count }, (_, i) => {
    const severity = randomItem(severities);
    const status = randomItem(alertStatuses);
    return {
      id: `alert-${Date.now()}-${i}`,
      title: randomItem(alertTitles[severity]),
      description: `Detected suspicious activity matching ${randomItem(mitreData).techniqueName} pattern on monitored asset.`,
      severity,
      status,
      timestamp: randomDate(),
      sourceIp: randomItem(sourceIps),
      user: randomItem(users),
      asset: randomItem(assets),
      mitre: randomItem(mitreData),
      eventCount: Math.floor(Math.random() * 200) + 1,
      confidence: Math.floor(Math.random() * 40) + 60,
      timeline: generateTimeline(Math.floor(Math.random() * 4) + 2),
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateLogs(count: number): LogEntry[] {
  const messages = [
    'Authentication failure for user from external IP',
    'Firewall denied connection attempt',
    'Process created with elevated privileges',
    'DNS query to known malicious domain',
    'File access on sensitive directory',
    'Network connection to unusual port',
    'Service configuration changed',
    'New user account created',
    'Certificate validation failed',
    'IDS signature match detected',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${Date.now()}-${i}`,
    timestamp: randomDate(),
    severity: randomItem(severities),
    message: randomItem(messages),
    asset: randomItem(assets),
    sourceIp: Math.random() > 0.3 ? randomItem(sourceIps) : undefined,
    user: randomItem(users),
    eventType: randomItem(eventTypes),
    details: {
      protocol: randomItem(['TCP', 'UDP', 'HTTPS', 'DNS']),
      port: String(randomItem([22, 80, 443, 3389, 8080, 53])),
      action: randomItem(['blocked', 'allowed', 'logged', 'quarantined']),
    },
  })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateIncidents(alerts: Alert[]): Incident[] {
  const incidentAlerts = alerts.filter(a => a.status === 'incident');
  if (incidentAlerts.length === 0) {
    return [{
      id: `inc-${Date.now()}`,
      title: 'Coordinated Brute Force Campaign',
      description: 'Multiple brute force attempts detected across several critical assets.',
      severity: 'high',
      status: 'investigating',
      createdAt: randomDate(12),
      updatedAt: randomDate(2),
      alertIds: alerts.slice(0, 3).map(a => a.id),
      assignee: 'analyst1',
    }];
  }
  return incidentAlerts.map((a, i) => ({
    id: `inc-${Date.now()}-${i}`,
    title: `Incident: ${a.title}`,
    description: a.description,
    severity: a.severity,
    status: randomItem(['open', 'investigating', 'contained', 'resolved'] as const),
    createdAt: a.timestamp,
    updatedAt: randomDate(2),
    alertIds: [a.id],
    assignee: 'analyst1',
  }));
}

export function generateSOCMetrics(alerts: Alert[]): SOCMetrics {
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach(a => bySeverity[a.severity]++);

  const trend = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    count: Math.floor(Math.random() * 20) + 1,
  }));

  const assetCounts = new Map<string, { asset: Asset; alertCount: number }>();
  alerts.forEach(a => {
    const existing = assetCounts.get(a.asset.id);
    if (existing) existing.alertCount++;
    else assetCounts.set(a.asset.id, { asset: a.asset, alertCount: 1 });
  });

  return {
    alertsBySeverity: bySeverity,
    mttd: Math.floor(Math.random() * 10) + 3,
    mttr: Math.floor(Math.random() * 30) + 10,
    incidentsToday: Math.floor(Math.random() * 5) + 1,
    alertsTrend: trend,
    topAttackedAssets: Array.from(assetCounts.values()).sort((a, b) => b.alertCount - a.alertCount),
  };
}

// Initial data
export const initialAlerts = generateAlerts(15);
export const initialLogs = generateLogs(60);
export const initialIncidents = generateIncidents(initialAlerts);
export const initialMetrics = generateSOCMetrics(initialAlerts);
