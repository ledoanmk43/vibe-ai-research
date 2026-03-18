'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Order, PaginatedResponse } from '@/types/api.types';
import dayjs from 'dayjs';

const fetcher = (url: string) => api.get<PaginatedResponse<Order>>(url);

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

export default function OrdersPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const query = new URLSearchParams({
    page: String(page + 1),
    limit: String(rowsPerPage),
  }).toString();

  // Don't fetch until auth token is ready — avoids 401 on page reload
  const { data, error, isLoading } = useSWR(authLoading ? null : `/orders?${query}`, fetcher);

  const orders = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  if (authLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700}>Orders</Typography>
          <Typography variant="body1" color="text.secondary">
            {total > 0 ? `${total} orders total` : 'Manage incoming laundry orders'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/orders/create')}
        >
          New Order
        </Button>
      </Stack>

      <Card>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>Failed to load orders</Alert>}
        {!isLoading && !error && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No orders yet</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      onClick={() => router.push(`/orders/${order.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #E91E90 0%, #F472B6 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {order.customer?.name?.[0]?.toUpperCase()}
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {order.customer?.name ?? 'Unknown'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[order.status]}
                          size="small"
                          sx={{
                            backgroundColor: `${STATUS_COLORS[order.status]}15`,
                            color: STATUS_COLORS[order.status],
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: `1px solid ${STATUS_COLORS[order.status]}30`,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
