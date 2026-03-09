import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Severity } from '@/lib/mockData';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  alertId: string;
  defaultAsset: string;
  defaultTitle: string;
  defaultSeverity: Severity;
  onSuccess: () => void;
}

export function CreateTicketModal({
  open, onClose, alertId, defaultAsset, defaultTitle, defaultSeverity, onSuccess,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [severity, setSeverity] = useState<Severity>(defaultSeverity);
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/api/incidents', {
        alertId,
        title,
        severity,
        assignedTo,
        description,
        affectedAsset: defaultAsset,
      });
      toast({ title: 'Incident ticket created' });
      onSuccess();
      onClose();
    } catch {
      toast({ title: 'Failed to create ticket', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Incident Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="analyst name" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Affected Asset</Label>
            <Input value={defaultAsset} disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !title.trim()}>
            {loading ? 'Creating…' : 'Create Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
