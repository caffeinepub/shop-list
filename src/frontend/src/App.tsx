import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginButton from './components/LoginButton';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import RoomsPage from './pages/RoomsPage';
import ShoppingListPage from './pages/ShoppingListPage';
import BudgetOverviewPage from './pages/BudgetOverviewPage';
import TasksPage from './pages/TasksPage';
import MoodboardsPage from './pages/MoodboardsPage';
import LogisticsPage from './pages/LogisticsPage';
import ClientsPage from './pages/ClientsPage';
import ProductLibraryPage from './pages/ProductLibraryPage';
import ClientPortalPage from './pages/ClientPortalPage';

function RootComponent() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (loginStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2">Interior Hub</h1>
              <p className="text-muted-foreground">Professional project management for interior designers</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Sign in to manage your projects, clients, and shopping lists</p>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProjectsPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});

const projectDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDashboardPage,
});

const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/rooms',
  component: RoomsPage,
});

const shoppingListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopping-lists',
  component: ShoppingListPage,
});

const budgetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/budget',
  component: BudgetOverviewPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/tasks',
  component: TasksPage,
});

const moodboardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/moodboards',
  component: MoodboardsPage,
});

const logisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logistics',
  component: LogisticsPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsPage,
});

const productLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product-library',
  component: ProductLibraryPage,
});

const clientPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client-portal',
  component: ClientPortalPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  projectDashboardRoute,
  roomsRoute,
  shoppingListRoute,
  budgetRoute,
  tasksRoute,
  moodboardsRoute,
  logisticsRoute,
  clientsRoute,
  productLibraryRoute,
  clientPortalRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
