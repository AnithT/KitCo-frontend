import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-[hsl(20_75%_38%)] text-primary-foreground">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/20">
            <span className="font-bold">K</span>
          </div>
          KitCo
        </div>
        <div className="space-y-3 max-w-md">
          <p className="text-2xl font-medium leading-snug text-balance">
            Run your kitchen from one screen — orders, menus, customers, broadcasts.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Built for chefs who&apos;d rather be cooking.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">
          &copy; {new Date().getFullYear()} KitCo
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-10 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
