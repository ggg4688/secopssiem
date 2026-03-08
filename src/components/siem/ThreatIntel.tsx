import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Rss, GitBranch, Globe, Mail, FileDigit, Server } from 'lucide-react';

// IOC Mock Data
type IOCType = 'IP Address' | 'Domain' | 'File Hash' | 'Email';

interface IOC {
  id: string;
  indicator: string;
  type: IOCType;
  source: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
}

const mockIOCs: IOC[] = [
  { id: 'ioc-1', indicator: '185.220.101.1', type: 'IP Address', source: 'AbuseIPDB', confidence: 95, firstSeen: new Date('2026-02-10'), lastSeen: new Date('2026-03-07') },
  { id: 'ioc-2', indicator: 'malware-c2.evil.com', type: 'Domain', source: 'AlienVault OTX', confidence: 88, firstSeen: new Date('2026-01-15'), lastSeen: new Date('2026-03-06') },
  { id: 'ioc-3', indicator: 'e99a18c428cb38d5f260853678922e03', type: 'File Hash', source: 'MISP', confidence: 92, firstSeen: new Date('2026-02-20'), lastSeen: new Date('2026-03-08') },
  { id: 'ioc-4', indicator: 'phishing@darknet.ru', type: 'Email', source: 'Internal', confidence: 78, firstSeen: new Date('2026-03-01'), lastSeen: new Date('2026-03-07') },
  { id: 'ioc-5', indicator: '203.0.113.42', type: 'IP Address', source: 'AbuseIPDB', confidence: 91, firstSeen: new Date('2026-02-25'), lastSeen: new Date('2026-03-08') },
  { id: 'ioc-6', indicator: 'dropper.payload.net', type: 'Domain', source: 'AlienVault OTX', confidence: 85, firstSeen: new Date('2026-01-28'), lastSeen: new Date('2026-03-05') },
  { id: 'ioc-7', indicator: 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5', type: 'File Hash', source: 'MISP', confidence: 97, firstSeen: new Date('2026-03-03'), lastSeen: new Date('2026-03-08') },
  { id: 'ioc-8', indicator: 'spear@phishing-corp.com', type: 'Email', source: 'Internal', confidence: 72, firstSeen: new Date('2026-02-14'), lastSeen: new Date('2026-03-04') },
  { id: 'ioc-9', indicator: '91.121.87.10', type: 'IP Address', source: 'AbuseIPDB', confidence: 89, firstSeen: new Date('2026-03-02'), lastSeen: new Date('2026-03-08') },
  { id: 'ioc-10', indicator: 'exfil-staging.darkweb.onion', type: 'Domain', source: 'AlienVault OTX', confidence: 93, firstSeen: new Date('2026-02-18'), lastSeen: new Date('2026-03-07') },
];

// Threat Feed Mock Data
interface ThreatFeed {
  id: string;
  source: string;
  indicatorCount: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  lastUpdate: Date;
}

const mockFeeds: ThreatFeed[] = [
  { id: 'feed-1', source: 'AbuseIPDB', indicatorCount: 12847, riskLevel: 'high', lastUpdate: new Date('2026-03-08T09:30:00') },
  { id: 'feed-2', source: 'AlienVault OTX', indicatorCount: 8432, riskLevel: 'critical', lastUpdate: new Date('2026-03-08T08:15:00') },
  { id: 'feed-3', source: 'MISP', indicatorCount: 5291, riskLevel: 'medium', lastUpdate: new Date('2026-03-08T07:45:00') },
];

// Kill Chain Stages
interface KillChainStage {
  id: string;
  name: string;
  description: string;
  incidentCount: number;
}

const killChainStages: KillChainStage[] = [
  { id: 'kc-1', name: 'Reconnaissance', description: 'Adversary identifies and selects targets', incidentCount: 8 },
  { id: 'kc-2', name: 'Initial Access', description: 'Techniques to gain entry into a network', incidentCount: 12 },
  { id: 'kc-3', name: 'Execution', description: 'Running adversary-controlled code', incidentCount: 6 },
  { id: 'kc-4', name: 'Persistence', description: 'Maintaining access across restarts', incidentCount: 4 },
  { id: 'kc-5', name: 'Privilege Escalation', description: 'Gaining higher-level permissions', incidentCount: 3 },
  { id: 'kc-6', name: 'Command & Control', description: 'Communication with compromised systems', incidentCount: 5 },
  { id: 'kc-7', name: 'Exfiltration', description: 'Stealing data from the network', incidentCount: 2 },
];

const iocTypeIcon: Record<IOCType, React.ReactNode> = {
  'IP Address': <Server className="h-3.5 w-3.5" />,
  'Domain': <Globe className="h-3.5 w-3.5" />,
  'File Hash': <FileDigit className="h-3.5 w-3.5" />,
  'Email': <Mail className="h-3.5 w-3.5" />,
};

const riskColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function confidenceColor(c: number) {
  if (c >= 90) return 'text-red-400';
  if (c >= 80) return 'text-orange-400';
  if (c >= 70) return 'text-yellow-400';
  return 'text-muted-foreground';
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d: Date) {
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ThreatIntel() {
  const [activeTab, setActiveTab] = useState('ioc');
  const totalIOCs = mockIOCs.length;
  const totalFeeds = mockFeeds.length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" /> IOC Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIOCs}</div>
            <p className="text-xs text-muted-foreground">Active indicators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Rss className="h-4 w-4" /> Threat Feeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeeds}</div>
            <p className="text-xs text-muted-foreground">Connected sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" /> Kill Chain Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{killChainStages.length}</div>
            <p className="text-xs text-muted-foreground">Stages monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ioc">IOC Database</TabsTrigger>
          <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
          <TabsTrigger value="killchain">Kill Chain</TabsTrigger>
        </TabsList>

        {/* IOC Database */}
        <TabsContent value="ioc">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indicators of Compromise</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIOCs.map((ioc) => (
                    <TableRow key={ioc.id}>
                      <TableCell className="font-mono text-sm">{ioc.indicator}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm">
                          {iocTypeIcon[ioc.type]}
                          {ioc.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{ioc.source}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${confidenceColor(ioc.confidence)}`}>
                          {ioc.confidence}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(ioc.firstSeen)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(ioc.lastSeen)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Feeds */}
        <TabsContent value="feeds">
          <div className="grid gap-4">
            {mockFeeds.map((feed) => (
              <Card key={feed.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Rss className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{feed.source}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feed.indicatorCount.toLocaleString()} indicators
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={riskColors[feed.riskLevel]}>
                        {feed.riskLevel.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatDateTime(feed.lastUpdate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Kill Chain */}
        <TabsContent value="killchain">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cyber Kill Chain Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {killChainStages.map((stage, i) => {
                  const barWidth = Math.max((stage.incidentCount / 12) * 100, 8);
                  return (
                    <div key={stage.id} className="flex items-center gap-4">
                      <span className="w-6 text-xs font-mono text-muted-foreground text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stage.name}</span>
                          <span className="text-xs text-muted-foreground">{stage.incidentCount} incidents</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
