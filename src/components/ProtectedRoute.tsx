import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ForbiddenPage from "@/pages/ForbiddenPage";

export function ProtectedRoute({ children, requireAdmin = false, requireOnboarding = false }: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOnboarding?: boolean;
}) {
  const { session, isAdmin, loading, hasCompletedOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (requireAdmin && !isAdmin) return <ForbiddenPage />;

  // If onboarding not complete and not already on /onboarding
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
