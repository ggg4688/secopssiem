import { Card } from '@/components/ui/card';
import { Shield, Users, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '@/lib/auth';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">User Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">Manage user accounts, roles and permissions.</p>
            <p className="text-2xl font-semibold mt-4">2</p>
            <p className="text-xs text-muted-foreground">Total users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">System Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground">Configure SIEM rules, thresholds and integrations.</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Audit Log</h3>
            </div>
            <p className="text-sm text-muted-foreground">View system audit trail and admin actions.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
