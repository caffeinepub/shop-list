import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import LoginButton from "./components/LoginButton";
import ProfileLoadingError from "./components/ProfileLoadingError";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { Toaster } from "./components/ui/sonner";
import { useGetCallerUserProfile } from "./hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ClientPortalPage from "./pages/ClientPortalPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ShoppingListPage from "./pages/ShoppingListPage";

function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground tracking-wide">{message}</p>
      </div>
    </div>
  );
}

function RootComponent() {
  const { identity, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
    error,
    refetch,
  } = useGetCallerUserProfile();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && profileLoading) {
      const timer = setTimeout(() => setLoadingTimeout(true), 10000);
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [isAuthenticated, profileLoading]);

  if (loginStatus === "initializing") {
    return <LoadingSpinner message="Inicjalizacja..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm mx-4">
          <div className="bg-card border border-border rounded-lg p-10 text-center shadow-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">
                Shop List
              </h1>
              <p className="text-sm text-muted-foreground">
                Lista zakupowa dla projektantów wnętrz
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Zaloguj się, aby zarządzać projektami i listami zakupowymi
              </p>
              <LoginButton />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Shop List.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Zbudowano z caffeine.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && (error || loadingTimeout)) {
    return (
      <ProfileLoadingError
        error={error ? String(error) : "Przekroczono czas ładowania profilu"}
        onRetry={() => {
          setLoadingTimeout(false);
          refetch();
        }}
      />
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (profileLoading || !isFetched) {
    return <LoadingSpinner message="Ładowanie profilu..." />;
  }

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ProjectsPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectDetailPage,
});

const shoppingListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopping-lists",
  component: ShoppingListPage,
});

const clientPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client-portal",
  component: ClientPortalPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  projectDetailRoute,
  shoppingListRoute,
  clientPortalRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
