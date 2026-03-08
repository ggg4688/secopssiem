import { useSIEMStore } from '@/lib/siemStore';
import { logout, getAuthUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Shield, Activity, AlertTriangle, FileText, RefreshCw,
  LayoutDashboard, Clock, LogOut, Sun, Moon
} from 'lucide-react';
import { format } from 'date-fns';

export function Header() {
  const { activeTab, setActiveTab, refreshData, alerts } = useSIEMStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = getAuthUser();

  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'closed').length;

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'alerts' as const, label: 'Alerts', icon: AlertTriangle, badge: newAlertsCount },
    { id: 'logs' as const, label: 'Logs', icon: Activity },
    { id: 'incidents' as const, label: 'Incidents', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">SecOps SIEM</span>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="relative"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                    {tab.badge}
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/20 border border-destructive/30 rounded-lg animate-pulse">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(), 'HH:mm:ss')}</span>
          </div>

          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.username}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
