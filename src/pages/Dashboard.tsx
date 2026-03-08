import { useSIEMStore } from '@/lib/siemStore';
import { Header } from '@/components/siem/Header';
import { SOCMetrics } from '@/components/siem/SOCMetrics';
import { AlertsList } from '@/components/siem/AlertsList';
import { LogsTable } from '@/components/siem/LogsTable';
import { IncidentsView } from '@/components/siem/IncidentsView';
import { ThreatIntel } from '@/components/siem/ThreatIntel';

export default function Dashboard() {
  const { activeTab } = useSIEMStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        {activeTab === 'dashboard' && <SOCMetrics />}
        {activeTab === 'alerts' && <AlertsList />}
        {activeTab === 'logs' && <LogsTable />}
        {activeTab === 'incidents' && <IncidentsView />}
        {activeTab === 'threat-intel' && <ThreatIntel />}
      </main>
    </div>
  );
}
