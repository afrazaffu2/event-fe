'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { User, Settings, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function UserNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  // Default profile images based on role
  const getDefaultAvatar = (role: string) => {
    if (role === 'admin') {
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
    } else {
      return 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={getDefaultAvatar(user.role)}
                alt={`${user.role} avatar`}
                data-ai-hint="person avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold">
                {user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.role === 'admin' ? 'Administrator' : 'Host'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs rounded-2xl p-0 overflow-hidden shadow-xl border border-gray-100">
          <DialogTitle asChild>
            <VisuallyHidden>Profile Details</VisuallyHidden>
          </DialogTitle>
          <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 pb-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md mb-2">
              <AvatarImage src={getDefaultAvatar(user.role)} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold text-3xl">
                {user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold text-gray-900 mt-2">
              {user.role === 'admin' ? 'Administrator' : 'Host'}
            </span>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">{user.email}</span>
          </div>
          <div className="px-6 pb-6 flex justify-center">
            <DialogClose asChild>
              <Button className="w-full" variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
