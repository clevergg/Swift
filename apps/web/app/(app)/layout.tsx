import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

// Layout приватной группы (dashboard). AuthGuard защищает ВСЁ поддерево —
// любая страница внутри (dashboard) требует авторизации, оборачивать каждую
// отдельно не нужно. Сайдбар + топбар — общий каркас дашборда.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
