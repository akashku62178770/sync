import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function IntegrationCallbackPage() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Communicate with the opener window
        if (window.opener) {
            if (code) {
                window.opener.postMessage(
                    { type: 'OAUTH_SUCCESS', code },
                    window.location.origin
                );
            } else if (error) {
                window.opener.postMessage(
                    { type: 'OAUTH_ERROR', error },
                    window.location.origin
                );
            }
            // Close the popup after a short delay to ensure message sending
            setTimeout(() => {
                window.close();
            }, 500);
        }
    }, [searchParams]);

    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Connecting account...</p>
                <p className="text-xs text-muted-foreground">This window will close automatically.</p>
            </div>
        </div>
    );
}
