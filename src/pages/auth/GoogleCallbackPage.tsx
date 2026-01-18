import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/api/useAuth';
import { useNotifications } from '@/store/useStore';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const googleAuth = useGoogleAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      addNotification('error', 'Google authentication failed');
      navigate('/login');
      return;
    }

    if (code) {
      googleAuth.mutate(
        { code },
        {
          onSuccess: () => {
            addNotification('success', 'Successfully logged in!');
            navigate('/dashboard');
          },
          onError: () => {
            addNotification('error', 'Failed to complete authentication');
            navigate('/login');
          },
        }
      );
    } else {
      navigate('/login');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
