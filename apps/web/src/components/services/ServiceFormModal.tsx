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
  InputAdornment,
} from '@mui/material';
import { api } from '@/lib/api';
import type { ServiceItem } from '@/types/api.types';
import { useAuth } from '@/context/AuthContext';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ServiceItem | null;
}

const EMPTY: Partial<ServiceItem> = {
  name: '', description: '', pricePerUnit: 0, unitType: 'KG', isActive: true,
};

export default function ServiceFormModal({
  open,
  onClose,
  onSuccess,
  editData,
}: ServiceFormProps) {
  const { appUser } = useAuth();
  const [form, setForm] = useState<Partial<ServiceItem>>(editData ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form when modal opens with new editData (useState only initializes once)
  useEffect(() => {
    if (open) {
      setForm(editData ?? EMPTY);
      setError('');
    }
  }, [open, editData]);

  const set = (key: keyof ServiceItem, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name?.trim()) { setError('Service name is required.'); return; }
    if (!form.pricePerUnit || form.pricePerUnit <= 0) { setError('Price must be greater than 0.'); return; }
    
    setError('');
    setSubmitting(true);
    
    try {
      const storeId = appUser?.storeId ?? form.storeId;
      const payload = { ...form, pricePerUnit: Number(form.pricePerUnit), storeId };
      
      if (editData) {
        await api.patch(`/services/${editData.id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExited = () => setForm(EMPTY);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onExited: handleExited }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editData ? 'Edit Service' : 'Add New Service'}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <TextField
            label="Service Name *"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Wash & Fold"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Price Per Unit *"
              type="number"
              value={form.pricePerUnit || ''}
              onChange={(e) => set('pricePerUnit', e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
              }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Unit Type *</InputLabel>
              <Select
                label="Unit Type *"
                value={form.unitType ?? 'KG'}
                onChange={(e) => set('unitType', e.target.value)}
                sx={{ borderRadius: '10px' }}
              >
                <MenuItem value="KG">Per Kilogram (KG)</MenuItem>
                <MenuItem value="PIECE">Per Piece</MenuItem>
                <MenuItem value="METER">Per Meter</MenuItem>
                <MenuItem value="PAIR">Per Pair</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Description"
            multiline
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional details about this service"
          />
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.isActive === false ? 'false' : 'true'}
              onChange={(e) => set('isActive', e.target.value === 'true')}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="true">Active (Available)</MenuItem>
              <MenuItem value="false">Inactive (Hidden)</MenuItem>
            </Select>
          </FormControl>
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
          {editData ? 'Save Changes' : 'Add Service'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
