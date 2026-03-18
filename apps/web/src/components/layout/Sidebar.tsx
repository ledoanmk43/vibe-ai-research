'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Added ReceiptIcon
import StoreIcon from '@mui/icons-material/Store';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuth } from '@/context/AuthContext';

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 72;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Customers', icon: <PeopleIcon />, href: '/customers' },
  { label: 'Orders', icon: <ShoppingCartIcon />, href: '/orders' },
  { label: 'Services', icon: <LocalLaundryServiceIcon />, href: '/services' },
  { label: 'Analytics', icon: <BarChartIcon />, href: '/analytics' },
];

const adminNavItems = [
  { label: 'Stores', icon: <StoreIcon />, href: '/stores' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, logout } = useAuth();

  const width = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
  const allItems =
    appUser?.role === 'ADMIN' ? [...navItems, ...adminNavItems] : navItems;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        '& .MuiDrawer-paper': {
          width,
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 50%, #3B1C5A 100%)',
          border: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={expanded ? 'space-between' : 'center'}
        sx={{ height: 64, px: expanded ? 2.5 : 1.5, flexShrink: 0 }}
      >
        {expanded && (
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalLaundryServiceIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              Laundry CRM
            </Typography>
          </Stack>
        )}
        <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {expanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Stack>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1, py: 0.5 }}>
        {allItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Tooltip title={expanded ? '' : item.label} placement="right" key={item.href}>
              <ListItemButton
                onClick={() => router.push(item.href)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: expanded ? 2 : 1.5,
                  justifyContent: expanded ? 'initial' : 'center',
                  borderLeft: active ? '3px solid #E91E90' : '3px solid transparent',
                  backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    minWidth: expanded ? 40 : 'unset',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'white' : 'rgba(255,255,255,0.7)',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* User info + Logout */}
      {expanded && appUser && (
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
            {appUser.role === 'ADMIN' ? '🛡 Administrator' : '🏪 Store Owner'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 1,
            }}
          >
            {appUser.displayName}
          </Typography>
          <Typography
            variant="overline"
            sx={{ px: 3, pt: 2, pb: 1, display: 'block', color: 'rgba(255,255,255,0.5)' }}
          >
            Management
          </Typography>

          <ListItem disablePadding>
            <ListItemButton
              selected={pathname === '/orders'}
              onClick={() => router.push('/orders')}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                justifyContent: 'initial',
                borderLeft: pathname === '/orders' ? '3px solid #E91E90' : '3px solid transparent',
                backgroundColor: pathname === '/orders' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === '/orders' ? 'white' : 'rgba(255,255,255,0.6)',
                  minWidth: 40,
                }}
              >
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText
                primary="Orders"
                slotProps={{
                  primary: {
                    fontSize: '0.875rem',
                    fontWeight: pathname === '/orders' ? 600 : 400,
                    color: pathname === '/orders' ? 'white' : 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={pathname.startsWith('/customers')}
              onClick={() => router.push('/customers')}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                justifyContent: 'initial',
                borderLeft: pathname.startsWith('/customers') ? '3px solid #E91E90' : '3px solid transparent',
                backgroundColor: pathname.startsWith('/customers') ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname.startsWith('/customers') ? 'white' : 'rgba(255,255,255,0.6)',
                  minWidth: 40,
                }}
              >
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Customers"
                slotProps={{
                  primary: {
                    fontSize: '0.875rem',
                    fontWeight: pathname.startsWith('/customers') ? 600 : 400,
                    color: pathname.startsWith('/customers') ? 'white' : 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={pathname === '/services'}
              onClick={() => router.push('/services')}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                justifyContent: 'initial',
                borderLeft: pathname === '/services' ? '3px solid #E91E90' : '3px solid transparent',
                backgroundColor: pathname === '/services' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === '/services' ? 'white' : 'rgba(255,255,255,0.6)',
                  minWidth: 40,
                }}
              >
                <LocalLaundryServiceIcon />
              </ListItemIcon>
              <ListItemText
                primary="Services"
                slotProps={{
                  primary: {
                    fontSize: '0.875rem',
                    fontWeight: pathname === '/services' ? 600 : 400,
                    color: pathname === '/services' ? 'white' : 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: 1.5,
              color: 'rgba(255,255,255,0.6)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#EF4444' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Sign out"
              slotProps={{ primary: { fontSize: '0.875rem' } }}
            />
          </ListItemButton>
        </Box>
      )}
      {!expanded && (
        <Tooltip title="Sign out" placement="right">
          <IconButton
            onClick={handleLogout}
            sx={{ mx: 'auto', mb: 2, color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#EF4444' } }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      )}
    </Drawer>
  );
}
