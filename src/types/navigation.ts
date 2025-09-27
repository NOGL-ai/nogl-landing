import { ReactNode } from 'react';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: ReactNode;
  isActive?: boolean;
  badge?: {
    text: string;
    variant: 'new' | 'soon' | 'default';
  };
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user?: UserProfile;
  onLogout?: () => void;
  className?: string;
}
