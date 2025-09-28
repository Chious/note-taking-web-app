'use client';

import { Button } from '@/components/ui/button';
import { Palette, Type, Lock, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export function SettingsSidebar({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Link href="/dashboard/setting/theme">
        <Button variant="ghost" className="w-full justify-start text-sm h-10">
          <Palette className="w-4 h-4 mr-2" />
          Color Theme
        </Button>
      </Link>

      <Link href="/dashboard/setting/font">
        <Button variant="ghost" className="w-full justify-start text-sm h-10">
          <Type className="w-4 h-4 mr-2" />
          Font Theme
        </Button>
      </Link>

      <Link href="/dashboard/setting/account">
        <Button variant="ghost" className="w-full justify-start text-sm h-10">
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </Link>

      <Separator className="my-2" />

      <Button
        variant="ghost"
        className="w-full justify-start text-sm h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => signOut({ callbackUrl: '/', redirect: true })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
