import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  SkipForward,
  Zap
} from 'lucide-react';
import { useOnboarding, useNotifications } from '@/store/useStore';
import { useUpdateProfile } from '@/hooks/api/useAuth';
import { 
  useConnectGoogle, 
  useConnectMeta, 
  useConnectClarity,
  useGAProperties,
  useSelectGAProperties,
  useMetaAccounts,
  useSelectMetaAccounts
} from '@/hooks/api/useIntegrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const steps = [
  { id: 1, title: 'Goals', description: 'Set your primary goal' },
  { id: 2, title: 'Analytics', description: 'Connect Google Analytics' },
  { id: 3, title: 'Ads', description: 'Connect Meta Ads' },
  { id: 4, title: 'Recordings', description: 'Connect Clarity' },
];

const goals = [
  { id: 'conversions', label: 'Increase Conversions', description: 'Focus on converting more visitors', icon: Target },
  { id: 'roas', label: 'Improve ROAS', description: 'Optimize ad spend efficiency', icon: TrendingUp },
  { id: 'traffic', label: 'Grow Traffic', description: 'Attract more visitors', icon: Users },
  { id: 'revenue', label: 'Maximize Revenue', description: 'Increase overall revenue', icon: DollarSign },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { onboardingStep, setOnboardingStep, completeOnboarding } = useOnboarding();
  const { addNotification } = useNotifications();
  
  const updateProfile = useUpdateProfile();
  const connectGoogle = useConnectGoogle();
  const connectMeta = useConnectMeta();
  const connectClarity = useConnectClarity();
  const { data: gaProperties } = useGAProperties();
  const { data: metaAccounts } = useMetaAccounts();
  const selectGAProperties = useSelectGAProperties();
  const selectMetaAccounts = useSelectMetaAccounts();

  const [direction, setDirection] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [metaConnected, setMetaConnected] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [clarityForm, setClarityForm] = useState({ api_key: '', project_id: '' });

  const goNext = () => {
    setDirection(1);
    if (onboardingStep < 5) {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const goPrev = () => {
    setDirection(-1);
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    updateProfile.mutate({ primary_goal: goalId as any });
  };

  const handleGoogleConnect = () => {
    connectGoogle.mutate(
      { code: 'mock-oauth-code' },
      {
        onSuccess: () => {
          setGoogleConnected(true);
          addNotification('success', 'Google Analytics connected!');
        },
      }
    );
  };

  const handleMetaConnect = () => {
    connectMeta.mutate(
      { code: 'mock-oauth-code' },
      {
        onSuccess: () => {
          setMetaConnected(true);
          addNotification('success', 'Meta Ads connected!');
        },
      }
    );
  };

  const handleClarityConnect = () => {
    if (!clarityForm.api_key || !clarityForm.project_id) {
      addNotification('error', 'Please fill in all fields');
      return;
    }
    connectClarity.mutate(clarityForm, {
      onSuccess: () => {
        addNotification('success', 'Clarity connected!');
        handleComplete();
      },
    });
  };

  const handleComplete = () => {
    completeOnboarding();
    addNotification('success', 'Onboarding complete! Welcome to Insightly.');
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">What's your primary goal?</h2>
              <p className="text-muted-foreground mt-2">
                We'll tailor your insights based on what matters most
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    selectedGoal === goal.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <div className={`rounded-lg p-2 ${
                    selectedGoal === goal.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <goal.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{goal.label}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  {selectedGoal === goal.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Connect Google Analytics</h2>
              <p className="text-muted-foreground mt-2">
                We'll analyze your website performance data
              </p>
            </div>
            
            {!googleConnected ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={handleGoogleConnect}
                  disabled={connectGoogle.isPending}
                >
                  {connectGoogle.isPending ? 'Connecting...' : 'Connect Google Analytics'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Google Analytics connected</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select properties to track:</p>
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
                      <div>
                        <p className="font-medium">{prop.name}</p>
                        <p className="text-sm text-muted-foreground">{prop.website_url}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Connect Meta Ads</h2>
              <p className="text-muted-foreground mt-2">
                Track your advertising performance (optional)
              </p>
            </div>
            
            {!metaConnected ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={handleMetaConnect}
                  disabled={connectMeta.isPending}
                >
                  {connectMeta.isPending ? 'Connecting...' : 'Connect Meta Ads'}
                </Button>
                <Button variant="ghost" className="gap-2" onClick={goNext}>
                  <SkipForward className="h-4 w-4" />
                  Skip for now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Meta Ads connected</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Select ad accounts:</p>
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
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.currency}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Connect Microsoft Clarity</h2>
              <p className="text-muted-foreground mt-2">
                Get session recordings and heatmaps (optional)
              </p>
            </div>
            
            <div className="space-y-4">
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

            <div className="flex flex-col gap-2">
              <Button 
                size="lg" 
                onClick={handleClarityConnect}
                disabled={connectClarity.isPending}
              >
                {connectClarity.isPending ? 'Connecting...' : 'Connect & Complete Setup'}
              </Button>
              <Button variant="ghost" onClick={handleComplete}>
                Skip & Complete Setup
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Insightly</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleComplete}>
          Skip setup
        </Button>
      </header>

      {/* Progress */}
      <div className="relative border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-center gap-2 px-6 py-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step.id < onboardingStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id === onboardingStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id < onboardingStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 transition-colors ${
                    step.id < onboardingStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={onboardingStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={onboardingStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          {onboardingStep < 4 && (
            <Button
              onClick={goNext}
              disabled={onboardingStep === 1 && !selectedGoal}
              className="gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
