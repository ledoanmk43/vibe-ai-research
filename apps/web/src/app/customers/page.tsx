'use client';

import { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import { useAuth } from '@/context/AuthContext';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/types/api.types';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

function fetcher(url: string) {
  return api.get<PaginatedResponse<Customer>>(url);
}

export default function CustomersPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearchRaw] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const query = new URLSearchParams({
    page: String(page + 1),
    limit: String(rowsPerPage),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }).toString();

  // Don't fetch until auth token is ready — avoids 401 on page reload
  const { data, error, isLoading, mutate } = useSWR(
    authLoading ? null : `/customers?${query}`,
    fetcher,
  );

  const customers = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  const openCreate = () => { setEditCustomer(null); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditCustomer(c); setFormOpen(true); };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await api.delete(`/customers/${id}`);
      await mutate();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  }, [mutate]);

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

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
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={700}>Customers</Typography>
          <Typography variant="body1" color="text.secondary">
            {total > 0 ? `${total} customers total` : 'Manage your customer directory'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Customer
        </Button>
      </Stack>

      {/* Search */}
      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          placeholder="Search by name, phone, or email…"
          value={search}
          onChange={(e) => { setSearchRaw(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Card>

      {/* Table */}
      <Card>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ m: 2 }}>Failed to load customers</Alert>}
        {!isLoading && !error && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">
                          {debouncedSearch ? 'No customers found for this search' : 'No customers yet'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {customers.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #E91E90 0%, #F472B6 100%)',
                            }}
                          >
                            {getInitials(c.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                            {c.address && (
                              <Typography variant="caption" color="text.secondary">
                                {c.address}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.phone ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.email ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.totalOrders ?? 0}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/customers/${c.id}`)}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(c)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(c.id)}
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

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => mutate()}
        editData={editCustomer}
      />
    </DashboardLayout>
  );
}
