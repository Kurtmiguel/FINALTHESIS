import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    router.push('/login');
    return null;
  }

  if (adminOnly && session.user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
};
