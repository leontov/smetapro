import { Outlet } from 'react-router-dom';

import TabBar from '@app/components/TabBar';
import NetworkIndicator from '@shared/components/NetworkIndicator';

const AppLayout = () => (
  <div className="flex min-h-screen flex-col">
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold tracking-wide text-cyan-300">SmetaPro</h1>
        <NetworkIndicator />
      </div>
    </header>
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </div>
    </main>
    <TabBar />
  </div>
);

export default AppLayout;
