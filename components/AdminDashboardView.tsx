'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { useDashboardData } from '@/components/admin/useDashboardData';
import { DashboardHeader, type Tab } from '@/components/admin/DashboardHeader';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { BeatsTab } from '@/components/admin/BeatsTab';
import { SalesTab } from '@/components/admin/SalesTab';
import { BeatFormModal } from '@/components/admin/BeatFormModal';

export function AdminDashboardView() {
  const { admin, isLoading: authLoading, logout } = useAdminAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');

  const d = useDashboardData();

  useEffect(() => {
    if (!authLoading && !admin) router.replace('/admin/login');
  }, [admin, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <DashboardHeader
        email={admin?.email}
        tab={tab}
        onTab={setTab}
        isLoading={d.isLoading}
        onRefresh={d.refresh}
        onLogout={handleLogout}
        notice={d.notice}
        error={d.error}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'overview' && (
          <OverviewTab stats={d.stats} recent={d.recent} onViewAll={() => setTab('sales')} />
        )}
        {tab === 'beats' && (
          <BeatsTab
            beats={d.beats}
            onAdd={d.openAdd}
            onEdit={d.openEdit}
            onDelete={d.handleDelete}
            onToggleSold={d.handleToggleSold}
          />
        )}
        {tab === 'sales' && <SalesTab sales={d.sales} />}
      </main>

      {d.showForm && (
        <BeatFormModal
          editingId={d.editingId}
          form={d.form}
          onChange={(patch) => d.setForm({ ...d.form, ...patch })}
          onClose={d.closeForm}
          onSubmit={d.handleSave}
          isSaving={d.isSaving}
          error={d.error}
        />
      )}
    </div>
  );
}

export default AdminDashboardView;