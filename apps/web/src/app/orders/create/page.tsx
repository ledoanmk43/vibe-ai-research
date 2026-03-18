'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Customer, ServiceItem, PaginatedResponse, Order } from '@/types/api.types';
import { useDebounce } from '@/hooks/useDebounce';

const fetchCustomers = (url: string) => api.get<PaginatedResponse<Customer>>(url);
const fetchServices = (url: string) => api.get<ServiceItem[]>(url);

interface SelectedItem {
  key: string; // unique local ID for React array rendering
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  notes: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedSearch = useDebounce(customerSearch, 400);
  
  const { data: customersData, isLoading: loadingCustomers } = useSWR(
    debouncedSearch ? `/customers?search=${debouncedSearch}&limit=10` : null,
    fetchCustomers
  );
  
  const { data: services, isLoading: loadingServices } = useSWR('/services', fetchServices);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const addItem = (service: ServiceItem) => {
    setItems((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).substring(7),
        serviceId: service.id,
        serviceName: service.name,
        unitPrice: Number(service.pricePerUnit),
        quantity: 1,
        notes: '',
      },
    ]);
  };

  const updateItem = (key: string, field: keyof SelectedItem, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) { setError('Please select a customer.'); return; }
    if (items.length === 0) { setError('Please add at least one service to the order.'); return; }
    
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        storeId: selectedCustomer.storeId, // Auto-associate to customer's store
        customerId: selectedCustomer.id,
        discount: Number(discount) || 0,
        notes: orderNotes,
        items: items.map((i) => ({
          serviceId: i.serviceId,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice),
          notes: i.notes,
        })),
      };
      
      const res = await api.post<Order>('/orders', payload);
      router.push(`/orders/${res.id}`);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to create order');
      setSubmitting(false);
    }
  };

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

      <Typography variant="h3" fontWeight={700} sx={{ mb: 4 }}>
        Create New Order
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Customer Selection */}
          <Card sx={{ mb: 4, p: 3, overflow: 'visible' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              1. Select Customer
            </Typography>
            <Autocomplete
              options={customersData?.data ?? []}
              getOptionLabel={(option) => `${option.name} (${option.phone || 'No phone'})`}
              onInputChange={(_, newInputValue) => setCustomerSearch(newInputValue)}
              onChange={(_, newValue) => setSelectedCustomer(newValue)}
              loading={loadingCustomers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Customer by name or phone..."
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {selectedCustomer && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(233, 30, 144, 0.05)', borderRadius: 2, border: '1px solid rgba(233, 30, 144, 0.2)' }}>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  Selected Customer
                </Typography>
                <Typography variant="body1" fontWeight={600}>{selectedCustomer.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer.phone} • {selectedCustomer.email || 'No email'}
                </Typography>
              </Box>
            )}
          </Card>

          {/* Service Items Selection */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                2. Order Items
              </Typography>
            </Stack>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Available Services
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {loadingServices && <CircularProgress size={24} />}
                {services?.map((svc) => (
                  <Chip
                    key={svc.id}
                    label={`${svc.name} - ${Number(svc.pricePerUnit).toLocaleString()}đ/${svc.unitType}`}
                    onClick={() => addItem(svc)}
                    icon={<AddCircleOutlineIcon />}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1, backgroundColor: 'rgba(233, 30, 144, 0.04)' }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="35%">Service</TableCell>
                  <TableCell width="20%">Price (đ)</TableCell>
                  <TableCell width="15%">Qty</TableCell>
                  <TableCell width="20%">Total</TableCell>
                  <TableCell width="10%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Click a service above to add it to the order.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{item.serviceName}</Typography>
                      <TextField
                        placeholder="Item notes..."
                        variant="standard"
                        fullWidth
                        size="small"
                        value={item.notes}
                        onChange={(e) => updateItem(item.key, 'notes', e.target.value)}
                        sx={{ mt: 1, input: { fontSize: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.key, 'unitPrice', e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.key, 'quantity', e.target.value)}
                        InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {(item.unitPrice * (item.quantity || 0)).toLocaleString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => removeItem(item.key)} size="small">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              3. Summary
            </Typography>
            
            <TextField
              label="Order Notes"
              multiline
              rows={3}
              fullWidth
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              sx={{ mb: 3, mt: 2 }}
              placeholder="Special instructions or timeline requests..."
            />

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={500}>{subtotal.toLocaleString('vi-VN')} đ</Typography>
              </Stack>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Discount</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  sx={{ width: 120 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                />
              </Stack>
              
              <Divider />
              
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Total To Pay</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={submitting || items.length === 0 || !selectedCustomer}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
