import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Palette,
  LogOut,
  Target,
  Mail,
  Moon,
  Sun,
  Shield
} from 'lucide-react';
import { useCurrentUser, useUpdateProfile, useLogout } from '@/hooks/api/useAuth';
import { useUI, useFeatureFlags, useNotifications } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SettingsSection({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-start gap-4 p-5 border-b">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const { theme, setTheme } = useUI();
  const { emailNotifications, setEmailNotifications } = useFeatureFlags();
  const { addNotification } = useNotifications();

  const handleGoalChange = (goal: string) => {
    updateProfile.mutate(
      { primary_goal: goal as any },
      {
        onSuccess: () => addNotification('success', 'Goal updated successfully'),
        onError: () => addNotification('error', 'Failed to update goal'),
      }
    );
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <SettingsSection
        title="Profile"
        description="Your account information"
        icon={User}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <div className="flex items-center gap-2">
                <p className="font-medium capitalize">{user?.plan_type}</p>
                <Badge variant="outline" className="text-xs">
                  {user?.plan_type === 'pro' ? 'Active' : 'Upgrade'}
                </Badge>
              </div>
            </div>
            {user?.plan_type !== 'enterprise' && (
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection
        title="Preferences"
        description="Customize your experience"
        icon={Settings}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Primary Goal</p>
                <p className="text-sm text-muted-foreground">Focus your insights on what matters</p>
              </div>
            </div>
            <Select
              value={user?.primary_goal}
              onValueChange={handleGoalChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="roas">ROAS</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      {/* Appearance Section */}
      <SettingsSection
        title="Appearance"
        description="Customize the look and feel"
        icon={Palette}
      >
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection
        title="Notifications"
        description="Manage how we contact you"
        icon={Bell}
      >
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive daily insight summaries</p>
            </div>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <motion.div variants={item} className="rounded-xl border border-destructive/30 bg-card overflow-hidden">
        <div className="flex items-start gap-4 p-5 border-b border-destructive/30">
          <div className="rounded-lg bg-destructive/10 p-2">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Log out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
