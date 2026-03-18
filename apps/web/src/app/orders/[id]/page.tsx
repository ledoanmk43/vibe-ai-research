'use client';

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Order } from '@/types/api.types';
import dayjs from 'dayjs';
import { useState } from 'react';

const fetcher = (url: string) => api.get<Order>(url);

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PROCESSING: '#3B82F6',
  READY_FOR_PICKUP: '#8B5CF6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'In Progress',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, error, isLoading, mutate } = useSWR(`/orders/${params.id}`, fetcher);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Order['status']) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}`, { status: newStatus });
      await mutate();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <Alert severity="error">Failed to load order</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/orders')}
        variant="text"
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Orders
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Order {order.orderNumber}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {dayjs(order.createdAt).format('MMMM D, YYYY • h:mm A')}
            </Typography>
            <Chip
              label={STATUS_LABELS[order.status]}
              size="small"
              sx={{
                backgroundColor: `${STATUS_COLORS[order.status]}15`,
                color: STATUS_COLORS[order.status],
                fontWeight: 600,
                border: `1px solid ${STATUS_COLORS[order.status]}30`,
              }}
            />
          </Stack>
        </Box>
        
        {/* Workflow actions */}
        <Stack direction="row" spacing={1}>
          {order.status === 'PENDING' && (
            <Button variant="contained" disabled={updating} onClick={() => handleStatusChange('PROCESSING')}>
              Start Washing
            </Button>
          )}
          {order.status === 'PROCESSING' && (
            <Button variant="contained" disabled={updating} onClick={() => handleStatusChange('READY_FOR_PICKUP')}>
              Mark Ready
            </Button>
          )}
          {order.status === 'READY_FOR_PICKUP' && (
            <Button variant="contained" color="success" disabled={updating} onClick={() => handleStatusChange('COMPLETED')}>
              Complete Order
            </Button>
          )}
          {['PENDING', 'PROCESSING'].includes(order.status) && (
            <Button variant="outlined" color="error" disabled={updating} onClick={() => handleStatusChange('CANCELLED')}>
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ flex: 2 }}>
          <Card>
            <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" fontWeight={600}>Order Items</Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {/* TypeScript complains if service isn't fully typed, but we populated it via relation */}
                        {(item as any).service?.name ?? 'Service'}
                      </Typography>
                      {item.notes && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{Number(item.unitPrice).toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {Number(item.subtotal).toLocaleString('vi-VN')}đ
                    </TableCell>
                  </TableRow>
                ))}
                
                {order.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ color: 'error.main' }}>Discount</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                      -{Number(order.discount).toLocaleString('vi-VN')}đ
                    </TableCell>
                  </TableRow>
                )}
                
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1" fontWeight={700}>Total Amount</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" fontWeight={600}>Customer Details</Typography>
            </Box>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {order.customer?.name}
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {order.customer?.phone ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {order.customer?.email ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Address:</strong> {order.customer?.address ?? '—'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <Box sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" fontWeight={600}>Order Notes</Typography>
              </Box>
              <CardContent>
                <Typography variant="body2">{order.notes}</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Stack>
    </DashboardLayout>
  );
}
