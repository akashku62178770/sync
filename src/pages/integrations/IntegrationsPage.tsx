import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Check, 
  X, 
  ExternalLink, 
  ChevronRight,
  Plus,
  RefreshCw,
  Settings2
} from 'lucide-react';
import { 
  useIntegrations, 
  useConnectGoogle, 
  useConnectMeta,
  useConnectClarity,
  useDisconnectIntegration,
  useGAProperties,
  useSelectGAProperties,
  useMetaAccounts,
  useSelectMetaAccounts
} from '@/hooks/api/useIntegrations';
import { useNotifications } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Integration card icons
const GoogleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const MetaIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24">
    <path fill="#0081FB" d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.8 15.6c-.4.6-1.1 1-1.9 1h-5.8c-.8 0-1.5-.4-1.9-1l-2.9-4.8c-.4-.6-.4-1.4 0-2l2.9-4.8c.4-.6 1.1-1 1.9-1h5.8c.8 0 1.5.4 1.9 1l2.9 4.8c.4.6.4 1.4 0 2l-2.9 4.8z" />
  </svg>
);

const ClarityIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24">
    <circle fill="#7B68EE" cx="12" cy="12" r="10" />
    <path fill="white" d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm4-2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
  </svg>
);

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  status?: 'active' | 'error' | 'pending';
  accountName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings?: () => void;
  isPending?: boolean;
}

function IntegrationCard({
  name,
  description,
  icon,
  connected,
  status,
  accountName,
  onConnect,
  onDisconnect,
  onSettings,
  isPending,
}: IntegrationCardProps) {
  return (
    <motion.div variants={item} className="rounded-xl border bg-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {connected && (
            <Badge 
              variant="outline" 
              className={
                status === 'active' ? 'border-success/30 text-success' :
                status === 'error' ? 'border-destructive/30 text-destructive' :
                'border-warning/30 text-warning'
              }
            >
              {status === 'active' ? 'Connected' : status === 'error' ? 'Error' : 'Pending'}
            </Badge>
          )}
        </div>

        {connected && accountName && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">{accountName}</p>
            <p className="text-xs text-muted-foreground">Connected account</p>
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-muted/30 flex gap-2">
        {connected ? (
          <>
            {onSettings && (
              <Button variant="outline" size="sm" className="gap-2" onClick={onSettings}>
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:text-destructive" 
              onClick={onDisconnect}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
              Disconnect
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={onConnect}
            disabled={isPending}
          >
            {isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Connect
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function IntegrationsPage() {
  const { addNotification } = useNotifications();
  const { data: integrations, isLoading } = useIntegrations();
  const { data: gaProperties } = useGAProperties();
  const { data: metaAccounts } = useMetaAccounts();
  
  const connectGoogle = useConnectGoogle();
  const connectMeta = useConnectMeta();
  const connectClarity = useConnectClarity();
  const disconnectIntegration = useDisconnectIntegration();
  const selectGAProperties = useSelectGAProperties();
  const selectMetaAccounts = useSelectMetaAccounts();

  const [showGAModal, setShowGAModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showClarityModal, setShowClarityModal] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [clarityForm, setClarityForm] = useState({ api_key: '', project_id: '' });

  const handleGoogleConnect = () => {
    // In real app, this would redirect to Google OAuth
    connectGoogle.mutate(
      { code: 'mock-oauth-code' },
      {
        onSuccess: () => {
          setShowGAModal(true);
          addNotification('success', 'Google connected! Select your properties.');
        },
        onError: () => addNotification('error', 'Failed to connect Google'),
      }
    );
  };

  const handleMetaConnect = () => {
    connectMeta.mutate(
      { code: 'mock-oauth-code' },
      {
        onSuccess: () => {
          setShowMetaModal(true);
          addNotification('success', 'Meta connected! Select your ad accounts.');
        },
        onError: () => addNotification('error', 'Failed to connect Meta'),
      }
    );
  };

  const handleClarityConnect = () => {
    connectClarity.mutate(clarityForm, {
      onSuccess: () => {
        setShowClarityModal(false);
        setClarityForm({ api_key: '', project_id: '' });
        addNotification('success', 'Clarity connected successfully!');
      },
      onError: () => addNotification('error', 'Failed to connect Clarity'),
    });
  };

  const handleDisconnect = (type: 'google' | 'meta' | 'clarity') => {
    disconnectIntegration.mutate(type, {
      onSuccess: () => addNotification('success', `${type} disconnected`),
      onError: () => addNotification('error', 'Failed to disconnect'),
    });
  };

  const handleSaveProperties = () => {
    selectGAProperties.mutate(
      { property_ids: selectedProperties },
      {
        onSuccess: () => {
          setShowGAModal(false);
          addNotification('success', 'Properties saved!');
        },
      }
    );
  };

  const handleSaveAccounts = () => {
    selectMetaAccounts.mutate(
      { account_ids: selectedAccounts },
      {
        onSuccess: () => {
          setShowMetaModal(false);
          addNotification('success', 'Ad accounts saved!');
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your analytics and advertising platforms
        </p>
      </div>

      {/* Integration cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <IntegrationCard
          name="Google Analytics"
          description="Connect GA4 to track website performance"
          icon={<GoogleIcon />}
          connected={!!integrations?.google}
          status={integrations?.google?.status}
          accountName={integrations?.google?.name}
          onConnect={handleGoogleConnect}
          onDisconnect={() => handleDisconnect('google')}
          onSettings={() => setShowGAModal(true)}
          isPending={connectGoogle.isPending}
        />

        <IntegrationCard
          name="Meta Ads"
          description="Connect Meta to track ad performance"
          icon={<MetaIcon />}
          connected={!!integrations?.meta}
          status={integrations?.meta?.status}
          accountName={integrations?.meta?.name}
          onConnect={handleMetaConnect}
          onDisconnect={() => handleDisconnect('meta')}
          onSettings={() => setShowMetaModal(true)}
          isPending={connectMeta.isPending}
        />

        <IntegrationCard
          name="Microsoft Clarity"
          description="Connect Clarity for session recordings"
          icon={<ClarityIcon />}
          connected={!!integrations?.clarity}
          status={integrations?.clarity?.status}
          accountName={integrations?.clarity?.name}
          onConnect={() => setShowClarityModal(true)}
          onDisconnect={() => handleDisconnect('clarity')}
          isPending={connectClarity.isPending}
        />
      </motion.div>

      {/* GA Properties Modal */}
      <Dialog open={showGAModal} onOpenChange={setShowGAModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select GA4 Properties</DialogTitle>
            <DialogDescription>
              Choose which properties to sync with Insightly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {gaProperties?.map((prop) => (
              <label
                key={prop.id}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
              >
                <Checkbox
                  checked={selectedProperties.includes(prop.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProperties([...selectedProperties, prop.id]);
                    } else {
                      setSelectedProperties(selectedProperties.filter((id) => id !== prop.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{prop.name}</p>
                  <p className="text-sm text-muted-foreground">{prop.website_url}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGAModal(false)}>Cancel</Button>
            <Button onClick={handleSaveProperties} disabled={selectGAProperties.isPending}>
              {selectGAProperties.isPending ? 'Saving...' : 'Save Properties'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meta Accounts Modal */}
      <Dialog open={showMetaModal} onOpenChange={setShowMetaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Meta Ad Accounts</DialogTitle>
            <DialogDescription>
              Choose which ad accounts to sync with Insightly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {metaAccounts?.map((account) => (
              <label
                key={account.id}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
              >
                <Checkbox
                  checked={selectedAccounts.includes(account.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAccounts([...selectedAccounts, account.id]);
                    } else {
                      setSelectedAccounts(selectedAccounts.filter((id) => id !== account.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.currency}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetaModal(false)}>Cancel</Button>
            <Button onClick={handleSaveAccounts} disabled={selectMetaAccounts.isPending}>
              {selectMetaAccounts.isPending ? 'Saving...' : 'Save Accounts'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarity Connect Modal */}
      <Dialog open={showClarityModal} onOpenChange={setShowClarityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Microsoft Clarity</DialogTitle>
            <DialogDescription>
              Enter your Clarity API credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Enter your API key"
                value={clarityForm.api_key}
                onChange={(e) => setClarityForm({ ...clarityForm, api_key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_id">Project ID</Label>
              <Input
                id="project_id"
                placeholder="Enter your project ID"
                value={clarityForm.project_id}
                onChange={(e) => setClarityForm({ ...clarityForm, project_id: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClarityModal(false)}>Cancel</Button>
            <Button 
              onClick={handleClarityConnect} 
              disabled={connectClarity.isPending || !clarityForm.api_key || !clarityForm.project_id}
            >
              {connectClarity.isPending ? 'Connecting...' : 'Connect Clarity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
