'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDF2F8 0%, #EFF6FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        {/* Logo / Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0px 8px 24px rgba(233, 30, 144, 0.3)',
          }}
        >
          <LocalLaundryServiceIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        {/* Title */}
        <Typography variant="h2" sx={{ mb: 1, fontWeight: 700 }}>
          Laundry{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CRM
          </Box>
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Modern customer & order management for laundry businesses.
        </Typography>

        {/* Status Card */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            mb: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
              Phase 1 — Foundation ✅
            </Typography>
            <Stack spacing={1} alignItems="flex-start">
              {[
                'NestJS 11 backend scaffolded',
                'TypeORM + PostgreSQL entities created',
                'Config module with Joi env validation',
                'Next.js 16 frontend scaffolded',
                'MUI 7 theme configured (pink/blue/white)',
                'Docker Compose ready',
              ].map((item) => (
                <Stack key={item} direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2">{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Tags */}
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Chip label="Next.js 16" sx={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 600 }} />
          <Chip label="NestJS 11" sx={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 600 }} />
          <Chip label="TypeORM 0.3" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
          <Chip label="MUI 7" sx={{ backgroundColor: '#FDF2F8', color: '#BE185D', fontWeight: 600 }} />
          <Chip label="PostgreSQL 16" sx={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />
        </Stack>

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 4 }}
          href="http://localhost:4000/api/v1/health"
          target="_blank"
        >
          Check API Health
        </Button>
      </Box>
    </Box>
  );
}
