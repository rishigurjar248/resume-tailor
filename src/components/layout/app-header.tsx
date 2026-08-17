'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import { PageTitle } from "./page-title";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect, useRef } from "react";
import { ModelSelector } from "@/components/shared/model-selector";
import { getDefaultModel } from "@/lib/ai-models";
import { useApiKeys, useDefaultModel } from "@/hooks/use-api-keys";

interface AppHeaderProps {
  children?: React.ReactNode;
  showUpgradeButton?: boolean;
  isProPlan?: boolean;
}

export function AppHeader({ children, isProPlan = true }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { apiKeys } = useApiKeys();
  const { defaultModel, setDefaultModel } = useDefaultModel();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (!defaultModel) setDefaultModel(getDefaultModel(isProPlan));
  }, [defaultModel, isProPlan, setDefaultModel]);

  const handleProfileClick = () => setIsOpen(false);

  return (
    <header className="h-14 border-b backdrop-blur-xl fixed top-0 left-0 right-0 z-40 shadow-md border-purple-200/50">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
      <div className="max-w-[2000px] mx-auto h-full px-3 flex items-center justify-between relative">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <Logo className="text-xl flex-shrink-0" />
          <div className="h-5 w-px bg-purple-200/50 hidden sm:block flex-shrink-0" />
          <div className="flex items-center min-w-0 max-w-[140px] sm:max-w-[300px] lg:max-w-[600px]">
            <div className="truncate max-w-[80ch] overflow-hidden text-ellipsis"><PageTitle /></div>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0">
          {children ?? (
            <>
              <nav className="hidden md:flex items-center gap-2">
                <ModelSelector
                  value={defaultModel}
                  onValueChange={setDefaultModel}
                  apiKeys={apiKeys}
                  isProPlan={isProPlan}
                  className="w-[220px] lg:w-[280px] h-8 text-xs"
                  placeholder="Select AI model"
                  showToast={false}
                />
                <div className="h-4 w-px bg-purple-200/50" />
                <Link href="/profile" prefetch={false} onClick={handleProfileClick} className={cn("flex items-center gap-1.5 px-2 lg:px-3 py-1 text-sm font-medium text-purple-600/80 hover:text-purple-800 transition-colors")}>
                  <User className="h-4 w-4" /><span className="hidden lg:inline">Profile</span>
                </Link>
                <div className="h-4 w-px bg-purple-200/50" />
                <SettingsButton />
                <div className="h-4 w-px bg-purple-200/50" />
                <LogoutButton />
              </nav>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <div className="flex flex-col gap-4 pt-6">
                    <ModelSelector value={defaultModel} onValueChange={setDefaultModel} apiKeys={apiKeys} isProPlan={isProPlan} className="w-full h-10 text-sm" placeholder="Select AI model" showToast={false} />
                    <Link href="/profile" prefetch={false} onClick={handleProfileClick} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-purple-600/80 hover:text-purple-800 hover:bg-purple-50 transition-colors"><User className="h-4 w-4" />Profile</Link>
                    <SettingsButton className="w-full justify-start" onAllowedNavigation={() => setIsOpen(false)} />
                    <LogoutButton className="w-full justify-start" />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
