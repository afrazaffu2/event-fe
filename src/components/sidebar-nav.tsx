'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  CalendarDays,
  Users,
  Ticket,
  BarChart3,
  Wallet,
  User,
  Star,
  Clock,
  MapPin,
  Layers3,
  LogOut,
  PanelLeft,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const allLinks = [
  { href: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'host'] },
  { href: '/budgets', label: 'Hosts', icon: Users, roles: ['admin'] },
  { href: '/categories', label: 'Categories', icon: Layers3, roles: ['admin'] },
  { href: '/amenities', label: 'Amenities', icon: Wifi, roles: ['admin'] },
  { href: '/events', label: 'Events', icon: CalendarDays, roles: ['admin', 'host'] },
  { href: '/schedules', label: 'Bookings', icon: Ticket, roles: ['host'] },
  { href: '/events/transactions', label: 'Transactions', icon: Wallet, roles: ['host'] },
  // Add more links as needed, e.g. analytics, reviews, etc.
  // { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'host'] },
  // { href: '/reviews', label: 'Reviews', icon: Star, roles: ['admin', 'host'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();

  const links = allLinks.filter(link => user?.role && link.roles.includes(user.role));

  return (
    <>
      {/* Hover area to auto-open sidebar when closed */}
      {state === 'collapsed' && (
        <div
          onMouseEnter={toggleSidebar}
          className="fixed left-0 top-0 h-full w-3 z-50 cursor-pointer bg-transparent"
          aria-label="Open sidebar"
        />
      )}
      <SidebarHeader className="flex items-center gap-2 p-4 relative">
        {/* Sidebar open/close toggle icon */}
        <button
          onClick={toggleSidebar}
          className="mr-3 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-6 h-6 text-blue-600" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary drop-shadow-lg"
          >
            <circle cx="14" cy="14" r="13" stroke="url(#sphereGradient)" strokeWidth="2.5" fill="url(#sphereFill)" />
            <defs>
              <linearGradient id="sphereGradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a21caf" />
              </linearGradient>
              <radialGradient id="sphereFill" cx="0.5" cy="0.5" r="0.5" fx="0.3" fy="0.3">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#ede9fe" />
              </radialGradient>
            </defs>
          </svg>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wide drop-shadow-lg">EventSphere</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={link.label}
              >
                <Link href={link.href} className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-blue-600 group-hover:text-purple-600 transition-colors duration-200" />
                  <span className="font-extrabold tracking-wide text-lg">{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{/* User settings or logout can go here */}</SidebarFooter>
    </>
  );
}
