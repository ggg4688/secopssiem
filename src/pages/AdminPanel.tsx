import { Card } from '@/components/ui/card';
import { Shield, Users, Settings, Activity, Server, Database, Clock, LogIn, LogOut, UserPlus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, subMinutes, subHours, subDays } from 'date-fns';

const mockUsers = [
  { username: 'admin', role: 'admin', status: 'active', lastLogin: subMinutes(new Date(), 12) },
  { username: 'user', role: 'user', status: 'active', lastLogin: subHours(new Date(), 3) },
  { username: 'analyst1', role: 'user', status: 'active', lastLogin: subHours(new Date(), 8) },
  { username: 'analyst2', role: 'user', status: 'inactive', lastLogin: subDays(new Date(), 14) },
];

const mockAuditLog = [
  { id: 1, timestamp: subMinutes(new Date(), 5), user: 'admin', action: 'login', detail: 'Successful login from 10.0.1.50', icon: LogIn },
  { id: 2, timestamp: subMinutes(new Date(), 18), user: 'admin', action: 'config_change', detail: 'Updated alert threshold for brute-force rule', icon: Settings },
  { id: 3, timestamp: subMinutes(new Date(), 42), user: 'user', action: 'login', detail: 'Successful login from 192.168.1.100', icon: LogIn },
  { id: 4, timestamp: subHours(new Date(), 1), user: 'admin', action: 'user_create', detail: 'Created user account "analyst1"', icon: UserPlus },
  { id: 5, timestamp: subHours(new Date(), 2), user: 'analyst1', action: 'alert_action', detail: 'Escalated alert ALT-003 to incident', icon: AlertTriangle },
  { id: 6, timestamp: subHours(new Date(), 4), user: 'admin', action: 'logout', detail: 'User logged out', icon: LogOut },
  { id: 7, timestamp: subHours(new Date(), 6), user: 'admin', action: 'config_change', detail: 'Enabled GeoIP blocking for CN, RU regions', icon: Settings },
  { id: 8, timestamp: subDays(new Date(), 1), user: 'admin', action: 'login', detail: 'Successful login from 10.0.1.50', icon: LogIn },
];

const systemStats = [
  { label: 'Uptime', value: '45d 12h 33m', icon: Clock },
  { label: 'Log Sources', value: '12 Active', icon: Server },
  { label: 'DB Size', value: '2.4 GB', icon: Database },
  { label: 'Total Users', value: String(mockUsers.length), icon: Users },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const user = getAuthUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user?.username}</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* System Overview */}
        <div>
          <h2 className="text-lg font-semibold mb-3">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemStats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <stat.icon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                </div>
                <p className="text-xl font-semibold">{stat.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* User Management */}
        <div>
          <h2 className="text-lg font-semibold mb-3">User Management</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((u) => (
                  <TableRow key={u.username}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'active' ? 'outline' : 'secondary'}
                        className={u.status === 'active' ? 'border-green-500/50 text-green-500' : ''}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(u.lastLogin, 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Audit Log */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Audit Log</h2>
          <Card className="divide-y divide-border">
            {mockAuditLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 p-1.5 rounded bg-muted">
                  <entry.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{entry.detail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by <span className="font-medium">{entry.user}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(entry.timestamp, 'MMM d, HH:mm')}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  );
}
