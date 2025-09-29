# Sidebar Component Documentation

A comprehensive sidebar navigation component with collapsible functionality, mobile responsive design, and support for dark theme.

## Features

- 🔄 Collapsible desktop sidebar with hover-to-expand
- 🖱️ Smart hover interactions and tooltips
- 📱 Mobile responsive with drawer
- 🌙 Dark theme optimized
- 🎨 Matches exact design specifications
- 🔧 Customizable navigation items
- 👤 User profile section with dropdown menu
- 📞 Support card with dismiss functionality
- 🏷️ Version info with badges
- 💾 Persistent state management
- ♿ Accessible with proper ARIA labels
- ⚡ Smooth animations and transitions

## Components

### `Sidebar`

Main sidebar component for desktop view with collapse functionality.

### `MobileSidebar`

Mobile drawer component using Headless UI.

### `SidebarItem`

Individual navigation item component.

### `SupportCard`

Dismissible support card component.

### `UserProfile`

User profile section in the footer.

### `SidebarLayout`

Complete layout wrapper with both desktop and mobile sidebars.

## Quick Start

### 1. Basic Usage

```tsx
'use client';

import { SidebarLayout } from '@/components/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';

export default function DashboardPage() {
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@nogl.io',
    avatar: '/api/placeholder/40/40',
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  return (
    <SidebarLayout user={user} onLogout={handleLogout}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Content
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Your main content goes here.
        </p>
      </div>
    </SidebarLayout>
  );
}
```

### 2. Custom Layout Integration

```tsx
'use client';

import { Sidebar, MobileSidebar } from '@/components/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    openMobile,
    closeMobile,
  } = useSidebar();

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
  };

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          user={user}
          onLogout={() => console.log('Logout')}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={closeMobile}
        user={user}
        onLogout={() => console.log('Logout')}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="lg:hidden p-4">
          <button onClick={openMobile}>
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 3. Testing Hover Functionality

```tsx
// Visit the demo page to see hover features in action
// Navigate to: /hover-demo

// Or test in your own component:
import { SidebarLayout } from '@/components/Sidebar';

export default function TestPage() {
  return (
    <SidebarLayout user={user} onLogout={handleLogout}>
      <div className="p-8">
        <h1>Test the sidebar hover functionality!</h1>
        <ol>
          <li>Click the collapse button in the sidebar</li>
          <li>Hover over the collapsed sidebar to see it expand</li>
          <li>Hover over individual icons to see tooltips</li>
          <li>Try the profile dropdown in both states</li>
        </ol>
      </div>
    </SidebarLayout>
  );
}
```

### 4. Customizing Navigation Items

Edit `/src/data/sidebarNavigation.tsx`:

```tsx
export const mainNavigationItems: NavigationSection = {
  id: 'main',
  title: 'MAIN',
  items: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      path: '/analytics',
      icon: <AnalyticsIcon />,
      badge: {
        text: 'NEW',
        variant: 'new',
      },
    },
    // Add more items...
  ],
};
```

## Hook Usage

### `useSidebar`

```tsx
const {
  isCollapsed,        // Boolean: sidebar collapsed state
  isMobileOpen,       // Boolean: mobile sidebar open state
  isHovered,          // Boolean: hover state for collapsed sidebar
  toggleCollapse,     // Function: toggle desktop sidebar
  openMobile,         // Function: open mobile sidebar
  closeMobile,        // Function: close mobile sidebar
  toggleMobile,       // Function: toggle mobile sidebar
  setHovered,         // Function: manually control hover state
} = useSidebar({
  defaultCollapsed: false,    // Initial collapsed state
  persistState: true,         // Save state to localStorage
  storageKey: 'sidebar-collapsed', // localStorage key
});
```

## Hover Functionality

The sidebar includes intelligent hover-to-expand functionality:

### **🖱️ Hover to Expand**

- When collapsed, hover over the sidebar to temporarily expand it
- Shows all navigation items and labels
- Smooth 300ms transitions
- Visual feedback with subtle shadow

### **💡 Tooltips**

- In collapsed mode, hover over navigation icons to see tooltips
- Shows navigation item names and badges
- Positioned to the right of the sidebar
- Includes arrow pointer for clear association

### **🎨 Visual Feedback**

- Collapsed sidebar gains shadow on hover
- Smooth width transitions
- All content scales appropriately
- Maintains design consistency

### **⚡ Smart Interactions**

- Hover state only activates when sidebar is collapsed
- No interference with click interactions
- Proper cleanup on mouse leave
- Works with all sidebar features (profile dropdown, support card, etc.)

## Styling

The sidebar uses Tailwind CSS with custom colors from the design:
- Background: `#111729`
- Text colors: `#FFF`, `#9293A9`, `#D7E0F4`
- Active color: `#375DFB`
- Support card background: `#171D31`

## TypeScript Support

All components are fully typed. Import types:

```tsx
import { 
  NavigationItem, 
  NavigationSection, 
  UserProfile,
  SidebarProps 
} from '@/types/navigation';
```

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management in mobile drawer
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Dependencies

- React 18+
- Next.js 14+
- Tailwind CSS
- Headless UI (for mobile drawer)
- clsx (for conditional classes)
