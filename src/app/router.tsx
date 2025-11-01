import { createBrowserRouter } from 'react-router-dom';

import AppLayout from '@app/layouts/AppLayout';
import DashboardPage from '@modules/dashboard/pages/DashboardPage';
import ProjectsPage from '@modules/projects/pages/ProjectsPage';
import SettingsPage from '@modules/settings/pages/SettingsPage';
import NotFoundPage from '@shared/components/NotFoundPage';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <DashboardPage />
        },
        {
          path: 'projects',
          element: <ProjectsPage />
        },
        {
          path: 'settings',
          element: <SettingsPage />
        }
      ]
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ]);
