'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, apiErrorMessage, apiValidationErrors } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile');

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof typeof profileData, string>>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Sinkron isi form dengan data profil yang dimuat asinkron dari API.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof typeof passwordData, string>>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!profileData.name.trim()) newErrors.name = 'Nama wajib diisi';
    else if (profileData.name.length > 100) newErrors.name = 'Nama maksimal 100 karakter';
    if (!profileData.email) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) newErrors.email = 'Format email tidak valid';
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.current_password) newErrors.current_password = 'Password saat ini wajib diisi';
    if (!passwordData.password) newErrors.password = 'Password baru wajib diisi';
    else if (passwordData.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    if (passwordData.password !== passwordData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    
    try {
      setProfileLoading(true);
      setProfileMessage('');
      const response = await api.updateUser({
        name: profileData.name,
        email: profileData.email,
      });
      if (response.data.success) {
        setProfileMessage('Profil berhasil diperbarui');
        refreshUser();
      } else {
        setProfileMessage(response.data.message ?? 'Gagal memperbarui profil');
      }
    } catch (err: unknown) {
      const fieldErrors = apiValidationErrors(err, Object.keys(profileData));

      if (Object.keys(fieldErrors).length > 0) {
        setProfileErrors(fieldErrors as Partial<Record<keyof typeof profileData, string>>);
      } else {
        setProfileMessage(apiErrorMessage(err, 'Gagal memperbarui profil'));
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setPasswordLoading(true);
      setPasswordMessage('');
      const response = await api.updatePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      if (response.data.success) {
        setPasswordMessage('Password berhasil diperbarui');
        setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      } else {
        setPasswordMessage(response.data.message ?? 'Gagal mengubah password');
      }
    } catch (err: unknown) {
      setPasswordMessage(apiErrorMessage(err, 'Gagal mengubah password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-7 7h14a7 7 0 01-7-7z' },
    { id: 'password', label: 'Password', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'appearance', label: 'Tampilan', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                className="h-10 px-4"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Kelola informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  error={profileErrors.name}
                  required
                  maxLength={100}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  error={profileErrors.email}
                  required
                />
                {profileMessage && (
                  <div className={`text-sm ${profileMessage.includes('Gagal') ? 'text-destructive' : 'text-success'}`}>
                    {profileMessage}
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="profile-form" loading={profileLoading}>
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Ganti password akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Password Saat Ini"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  error={passwordErrors.current_password}
                  required
                  autoComplete="current-password"
                />
                <Input
                  label="Password Baru"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  error={passwordErrors.password}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <Input
                  label="Konfirmasi Password Baru"
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  error={passwordErrors.password_confirmation}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  Password minimal 8 karakter.
                </p>
                {passwordMessage && (
                  <div className={`text-sm ${passwordMessage.includes('Gagal') || passwordMessage.includes('belum') ? 'text-destructive' : 'text-success'}`}>
                    {passwordMessage}
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="password-form" loading={passwordLoading}>
                Ubah Password
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <Card>
            <CardHeader>
              <CardTitle>Tampilan</CardTitle>
              <CardDescription>Atur preferensi tampilan aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Mode Tema
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={theme === t ? 'primary' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => handleThemeChange(t)}
                    >
                      {t === 'light' && (
                        <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                      {t === 'dark' && (
                        <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                        </svg>
                      )}
                      {t === 'system' && (
                        <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="text-sm font-medium capitalize">{t}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Bahasa</h4>
                <p className="text-sm text-muted-foreground">Bahasa Indonesia (default)</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Mata Uang</h4>
                <p className="text-sm text-muted-foreground">Rupiah (IDR)</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}