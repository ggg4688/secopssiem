import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const PLAYBOOKS = [
  'Contain Host',
  'Block Malicious IP',
  'Disable Suspicious User',
  'Collect Memory Dump',
] as const;

interface RunPlaybookModalProps {
  open: boolean;
  onClose: () => void;
  alertId: string;
  onSuccess: (playbook: string) => void;
}

export function RunPlaybookModal({ open, onClose, alertId, onSuccess }: RunPlaybookModalProps) {
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.post('/api/playbooks/run', { alertId, playbook: selected });
      toast({ title: 'Playbook executed' });
      onSuccess(selected);
      onClose();
    } catch {
      toast({ title: 'Failed to run playbook', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Run Playbook</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <Label>Select Playbook</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Choose a playbook…" /></SelectTrigger>
            <SelectContent>
              {PLAYBOOKS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleRun} disabled={loading || !selected}>
            {loading ? 'Running…' : 'Run'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
