'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { DashboardKpis } from '@/types/analytics.types';
import CircularProgress from '@mui/material/CircularProgress';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const fetcher = (url: string) => api.get<DashboardKpis>(url);

export default function DashboardPage() {
  const { data: kpis, isLoading, error } = useSWR<DashboardKpis>('/analytics/dashboard', fetcher);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const statCards = [
    { label: 'Total Customers', value: kpis?.totalCustomers ?? '—', icon: <PeopleIcon />, color: '#E91E90' },
    { label: 'Active Orders', value: kpis?.activeOrders ?? '—', icon: <ShoppingCartIcon />, color: '#38BDF8' },
    { label: 'Revenue (Month)', value: kpis ? formatCurrency(kpis.revenueThisMonth) : '—', icon: <AttachMoneyIcon />, color: '#10B981' },
    { label: 'Total Revenue', value: kpis ? formatCurrency(kpis.totalRevenue) : '—', icon: <TrendingUpIcon />, color: '#F59E0B' },
  ];
  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here&apos;s an overview of your laundry business.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', color: 'error.main', py: 10 }}>
          <Typography>Failed to load dashboard data.</Typography>
        </Box>
      ) : (
        <>
          {/* Stat Card Grid */}
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Card
            key={card.label}
            sx={{
              minWidth: 200,
              flex: '1 1 200px',
              background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
              border: `1px solid ${card.color}30`,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Analytics charts coming in Phase 5 🚀
          </Typography>
        </CardContent>
      </Card>
        </>
      )}
    </DashboardLayout>
  );
}
