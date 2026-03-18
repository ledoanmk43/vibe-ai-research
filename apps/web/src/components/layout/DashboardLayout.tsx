'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { appUser, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    router.replace('/login');
  };

  const initials = appUser?.displayName
    ? appUser.displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Bar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
              {appUser?.store && (
                <Typography variant="body2" color="text.secondary">
                  Store:{' '}
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {appUser.store.name}
                  </Box>
                </Typography>
              )}
              {appUser?.role === 'ADMIN' && (
                <Chip
                  label="Administrator"
                  size="small"
                  sx={{ backgroundColor: '#FDF2F8', color: '#BE185D', fontWeight: 600 }}
                />
              )}

              {/* User avatar */}
              <Avatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180 } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{appUser?.displayName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {appUser?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
                  Sign out
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          {/* Page content */}
          <Box component="main" sx={{ flex: 1, p: 4, overflow: 'auto' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
