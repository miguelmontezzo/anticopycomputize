import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

export type PortalClient = {
  id: string;
  name: string;
  slug: string | null;
  email: string | null;
  plan_type: string | null;
  portal_enabled: boolean;
};

export type PortalNotification = {
  id: string;
  client_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

interface ClientPortalContextValue {
  client: PortalClient | null;
  user: User | null;
  notifications: PortalNotification[];
  unreadCount: number;
  refreshNotifications: () => void;
  markAsRead: (id: string) => void;
}

export const ClientPortalContext = createContext<ClientPortalContextValue>({
  client: null,
  user: null,
  notifications: [],
  unreadCount: 0,
  refreshNotifications: () => {},
  markAsRead: () => {},
});

export const useClientPortal = () => useContext(ClientPortalContext);
