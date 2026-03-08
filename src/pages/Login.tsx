import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password);
    if (user) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">SecOps SIEM</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo: admin/admin or user/user
        </p>
      </Card>
    </div>
  );
}
