'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StoreIcon from '@mui/icons-material/Store';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Store, PaginatedResponse } from '@/types/api.types';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => api.get<PaginatedResponse<Store>>(url);

const EMPTY_FORM = { name: '', address: '', phone: '', email: '' };

export default function StoresPage() {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === 'ADMIN';

  const { data, error, isLoading, mutate } = useSWR('/stores?limit=50', fetcher);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Store | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (store: Store) => {
    setEditTarget(store);
    setForm({ name: store.name, address: store.address ?? '', phone: store.phone ?? '', email: store.email ?? '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setFormError('Store name is required.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      if (editTarget) {
        await api.patch(`/stores/${editTarget.id}`, form);
      } else {
        await api.post('/stores', form);
      }
      await mutate();
      setDialogOpen(false);
    } catch (e: unknown) {
      setFormError((e as Error).message ?? 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [form, editTarget, mutate]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this store? This cannot be undone.')) return;
    try {
      await api.delete(`/stores/${id}`);
      await mutate();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  }, [mutate]);

  const stores: Store[] = Array.isArray(data) ? [data as unknown as Store] : (data?.data ?? []);

  return (
    <DashboardLayout>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700}>Stores</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all laundry branches
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Store
          </Button>
        )}
      </Stack>

      <Card>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>Failed to load stores</Alert>}
        {!isLoading && !error && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Store Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Staff</TableCell>
                  {isAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <StoreIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No stores yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {stores.map((store) => (
                  <TableRow key={store.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {store.name[0]}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{store.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {store.address ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{store.phone ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{store.email ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="—" size="small" />
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openEdit(store)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(store.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}
            <TextField
              label="Store Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {editTarget ? 'Save Changes' : 'Create Store'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
