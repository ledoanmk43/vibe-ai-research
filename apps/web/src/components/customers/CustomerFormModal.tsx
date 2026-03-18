'use client';

import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { api } from '@/lib/api';
import type { Customer } from '@/types/api.types';
import { useAuth } from '@/context/AuthContext';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Customer | null;
}

const EMPTY: Partial<Customer> = {
  name: '', phone: '', email: '', address: '', notes: '',
};

export default function CustomerFormModal({
  open,
  onClose,
  onSuccess,
  editData,
}: CustomerFormProps) {
  const { appUser } = useAuth();
  const [form, setForm] = useState<Partial<Customer>>(editData ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form when modal opens with new editData (useState won't re-init on prop change)
  useEffect(() => {
    if (open) {
      setForm(editData ?? EMPTY);
      setError('');
    }
  }, [open, editData]);

  const set = (key: keyof Customer, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name?.trim()) { setError('Full name is required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const storeId = appUser?.storeId ?? form.storeId;
      if (editData) {
        await api.patch(`/customers/${editData.id}`, form);
      } else {
        await api.post('/customers', { ...form, storeId });
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form when dialog exit animation completes
  const handleExited = () => setForm(EMPTY);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onExited: handleExited }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editData ? 'Edit Customer' : 'Add New Customer'}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <TextField
            label="Full Name *"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Phone"
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>

          <TextField
            label="Address"
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
          />

          <TextField
            label="Notes"
            multiline
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {editData ? 'Save Changes' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
