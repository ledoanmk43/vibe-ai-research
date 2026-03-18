'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Customer } from '@/types/api.types';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const fetcher = (url: string) => api.get<Customer>(url);

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box sx={{ color: 'text.secondary', mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value ?? '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, error, isLoading, mutate } = useSWR(
    `/customers/${params.id}`,
    fetcher,
  );
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await api.delete(`/customers/${params.id}`);
      router.push('/customers');
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress size={48} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout>
        <Alert severity="error">Failed to load customer</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back button + actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/customers')}
          variant="outlined"
        >
          Back to Customers
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Tooltip title="Delete customer">
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Profile Card */}
        <Card sx={{ minWidth: 280, maxWidth: { md: 320 } }}>
          <CardContent sx={{ textAlign: 'center', pt: 4 }}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
                mx: 'auto',
                mb: 2,
                boxShadow: '0px 8px 24px rgba(233, 30, 144, 0.25)',
              }}
            >
              {getInitials(customer.name)}
            </Avatar>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {customer.name}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5} alignItems="flex-start" sx={{ px: 1 }}>
              <InfoRow icon={<PhoneIcon fontSize="small" />} label="Phone" value={customer.phone} />
              <InfoRow icon={<EmailIcon fontSize="small" />} label="Email" value={customer.email} />
              <InfoRow icon={<LocationOnIcon fontSize="small" />} label="Address" value={customer.address} />
              {customer.notes && (
                <InfoRow icon={<NotesIcon fontSize="small" />} label="Notes" value={customer.notes} />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Stats + Orders */}
        <Box sx={{ flex: 1 }}>
          {/* Stat Pills */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            {[
              { label: 'Total Orders', value: customer.totalOrders ?? 0, color: '#E91E90' },
              { label: 'Total Spent', value: `${(customer.totalSpent ?? 0).toLocaleString('vi-VN')}đ`, color: '#38BDF8' },
              { label: 'Loyalty Points', value: customer.loyaltyPoints ?? 0, color: '#10B981' },
            ].map((stat) => (
              <Card
                key={stat.label}
                sx={{
                  flex: '1 1 140px',
                  border: `1px solid ${stat.color}30`,
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                }}
              >
                <CardContent sx={{ py: '12px !important' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Orders placeholder */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Order History
                </Typography>
              </Stack>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  Order history will appear here (Phase 4)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => mutate()}
        editData={customer}
      />
    </DashboardLayout>
  );
}
