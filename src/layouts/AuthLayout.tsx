import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold">Insightly</span>
      </div>

      {/* Content card */}
      <div className="relative w-full max-w-md">
        <div className="glass-panel p-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-sm text-muted-foreground">
        © 2024 Insightly. All rights reserved.
      </p>
    </div>
  );
}
