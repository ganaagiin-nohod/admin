import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  tableNumber?: string;
  source:
    | 'website'
    | 'opentable'
    | 'resy'
    | 'partner'
    | 'mobile_app'
    | 'phone'
    | 'walk_in';
  externalId?: string;
  metadata?: {
    platform?: string;
    referenceNumber?: string;
    commission?: number;
    partnerFee?: number;
    originalUrl?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  source?:
    | 'website'
    | 'opentable'
    | 'resy'
    | 'partner'
    | 'mobile_app'
    | 'phone'
    | 'walk_in';
  externalId?: string;
  metadata?: {
    platform?: string;
    referenceNumber?: string;
    commission?: number;
    partnerFee?: number;
    originalUrl?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}
