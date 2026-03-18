'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ServiceFormModal from '@/components/services/ServiceFormModal';
import { useAuth } from '@/context/AuthContext';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { ServiceItem } from '@/types/api.types';

const fetcher = (url: string) => api.get<ServiceItem[]>(url);

export default function ServicesPage() {
  const { loading: authLoading } = useAuth();
  const { data: services, error, isLoading, mutate } = useSWR(
    authLoading ? null : '/services',
    fetcher,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceItem | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      await api.delete(`/services/${id}`);
      await mutate();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  }, [mutate]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const openCreate = () => { setEditService(null); setFormOpen(true); };
  const openEdit = (s: ServiceItem) => { setEditService(s); setFormOpen(true); };

  return (
    <DashboardLayout>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700}>Services</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your laundry services and pricing
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Service
        </Button>
      </Stack>

      <Card>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>Failed to load services</Alert>}
        {!isLoading && !error && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!services || services.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <LocalLaundryServiceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No services configured yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {services?.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {s.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {Number(s.pricePerUnit).toLocaleString('vi-VN')}đ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`per ${s.unitType}`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={s.isActive ? 'success' : 'default'}
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(s)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(s.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <ServiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => mutate()}
        editData={editService}
      />
    </DashboardLayout>
  );
}
