import { BrowserRouter, Routes, Route, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { Login } from '@/routes/Login';
import { Register } from '@/routes/Register';
import { Dashboard } from '@/routes/Dashboard';
import { AdminPanel } from '@/routes/AdminPanel';
import { ChapterList } from '@/routes/ChapterList';
import { ChapterDetail } from '@/routes/ChapterDetail';
import { ChapterSettings } from '@/routes/ChapterSettings';
import { ChapterSettingsRedirect } from '@/routes/ChapterSettingsRedirect';
import { MembersRedirect } from '@/routes/MembersRedirect';
import { MemberRegistration } from '@/routes/MemberRegistration';
import { Profile } from '@/routes/Profile';
import { MemberCredential } from '@/routes/MemberCredential';
import { Birthdays } from '@/routes/Birthdays';

function ProtectedLayout() {
  const auth = useAuth();

  return (
    <ProtectedRoute isAuthenticated={auth.isAuthenticated} loading={auth.loading}>
      <Navigation profile={auth.profile} onLogout={auth.logout} />
      <Outlet context={auth} />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/chapters" element={<ChapterList />} />
          <Route path="/chapters/:id" element={<ChapterDetail />} />
          <Route path="/chapters/:id/settings" element={<ChapterSettings />} />
          <Route path="/chapter/settings" element={<ChapterSettingsRedirect />} />
          <Route path="/members" element={<MembersRedirect />} />
          <Route path="/members/new" element={<MemberRegistration />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/members/:id/credential" element={<MemberCredential />} />
          <Route path="/birthdays" element={<Birthdays />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
