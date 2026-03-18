'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import type { ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { firebaseUser, loading, signInWithGoogle, signInWithPhone } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace('/dashboard');
    }
  }, [firebaseUser, loading, router]);

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) { setError('Please enter a phone number.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const result = await signInWithPhone(phone, 'recaptcha-container');
      setConfirmation(result);
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Check the phone number and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !confirmation) return;
    setError('');
    setSubmitting(true);
    try {
      await confirmation.confirm(otp);
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" ref={recaptchaRef} />

      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: 4,
          boxShadow: '0px 32px 64px rgba(0, 0, 0, 0.15)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #E91E90 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 8px 20px rgba(233, 30, 144, 0.35)',
              }}
            >
              <LocalLaundryServiceIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Laundry CRM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your laundry business
            </Typography>
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step: Choose method */}
          {step === 'method' && (
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />}
                onClick={handleGoogle}
                disabled={submitting}
                sx={{ py: 1.5 }}
              >
                Continue with Google
              </Button>

              <Divider>
                <Typography variant="caption" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<PhoneIcon />}
                onClick={() => setStep('phone')}
                sx={{ py: 1.5 }}
              >
                Continue with Phone
              </Button>
            </Stack>
          )}

          {/* Step: Enter phone */}
          {step === 'phone' && (
            <Stack spacing={2}>
              <TextField
                label="Phone Number"
                placeholder="+84901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Include country code (e.g., +84 for Vietnam)"
              />
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSendOtp}
                disabled={submitting}
                sx={{ py: 1.5 }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
              </Button>
              <Button variant="text" onClick={() => setStep('method')} size="small">
                Back
              </Button>
            </Stack>
          )}

          {/* Step: Verify OTP */}
          {step === 'otp' && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter the 6-digit code sent to <strong>{phone}</strong>
              </Typography>
              <TextField
                label="OTP Code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6 }}
              />
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={submitting || otp.length < 6}
                sx={{ py: 1.5 }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
              </Button>
              <Button variant="text" onClick={() => setStep('phone')} size="small">
                Back
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
