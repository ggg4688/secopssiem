import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  incidentId: string;
  onSuccess: () => void;
}

export function AddNoteModal({ open, onClose, incidentId, onSuccess }: AddNoteModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await api.post(`/api/incidents/${incidentId}/comments`, { note });
      toast({ title: 'Note added' });
      onSuccess();
      setNote('');
      onClose();
    } catch {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Investigation Note</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <Label>Note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Enter investigation note…" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !note.trim()}>
            {loading ? 'Adding…' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
