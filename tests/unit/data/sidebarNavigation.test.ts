import {
  mainNavigationItems,
  otherNavigationItems,
  versionInfo,
  defaultUserProfile,
} from '@/data/sidebarNavigation.tsx';
import { NavigationSection, UserProfile } from '@/types/navigation.ts';

describe('Sidebar Navigation Data', () => {
  describe('mainNavigationItems', () => {
    it('has correct structure', () => {
      expect(mainNavigationItems).toHaveProperty('id', 'main');
      expect(mainNavigationItems).toHaveProperty('title', '');
      expect(mainNavigationItems).toHaveProperty('items');
      expect(Array.isArray(mainNavigationItems.items)).toBe(true);
    });

    it('contains expected navigation items', () => {
      const itemIds = mainNavigationItems.items.map(item => item.id);
      expect(itemIds).toContain('dashboard');
      expect(itemIds).toContain('my-catalog');
      expect(itemIds).toContain('competitors');
      expect(itemIds).toContain('repricing');
      expect(itemIds).toContain('reports');
      expect(itemIds).toContain('product-feed');
    });

    it('has valid navigation item structure', () => {
      mainNavigationItems.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('icon');
        expect(typeof item.id).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(typeof item.path).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.path.length).toBeGreaterThan(0);
      });
    });

    it('has valid paths', () => {
      mainNavigationItems.items.forEach(item => {
        expect(item.path).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
      });
    });

    it('has React elements as icons', () => {
      mainNavigationItems.items.forEach(item => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('object');
        expect(item.icon).toHaveProperty('type');
      });
    });

    it('has items with submenus', () => {
      const itemsWithSubmenus = mainNavigationItems.items.filter(item => item.submenu);
      expect(itemsWithSubmenus.length).toBeGreaterThan(0);
      
      const competitorsItem = mainNavigationItems.items.find(item => item.id === 'competitors');
      expect(competitorsItem?.submenu).toBeDefined();
      expect(Array.isArray(competitorsItem?.submenu)).toBe(true);
      expect(competitorsItem?.submenu?.length).toBeGreaterThan(0);
    });

    it('has valid submenu structure', () => {
      const itemsWithSubmenus = mainNavigationItems.items.filter(item => item.submenu);
      
      itemsWithSubmenus.forEach(item => {
        item.submenu!.forEach(subItem => {
          expect(subItem).toHaveProperty('id');
          expect(subItem).toHaveProperty('title');
          expect(subItem).toHaveProperty('path');
          expect(typeof subItem.id).toBe('string');
          expect(typeof subItem.title).toBe('string');
          expect(typeof subItem.path).toBe('string');
          expect(subItem.id.length).toBeGreaterThan(0);
          expect(subItem.title.length).toBeGreaterThan(0);
          expect(subItem.path.length).toBeGreaterThan(0);
        });
      });
    });

    it('has valid submenu paths', () => {
      const itemsWithSubmenus = mainNavigationItems.items.filter(item => item.submenu);
      
      itemsWithSubmenus.forEach(item => {
        item.submenu!.forEach(subItem => {
          expect(subItem.path).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
        });
      });
    });

    it('has repricing item with multiple submenu items', () => {
      const repricingItem = mainNavigationItems.items.find(item => item.id === 'repricing');
      expect(repricingItem?.submenu).toBeDefined();
      expect(repricingItem?.submenu?.length).toBe(3);
      
      const submenuTitles = repricingItem?.submenu?.map(sub => sub.title) || [];
      expect(submenuTitles).toContain('Auto Repricing Rules');
      expect(submenuTitles).toContain('Auto Repricing Overview');
      expect(submenuTitles).toContain('Auto Repricing History');
    });
  });

  describe('otherNavigationItems', () => {
    it('has correct structure', () => {
      expect(otherNavigationItems).toHaveProperty('id', 'other');
      expect(otherNavigationItems).toHaveProperty('title', '');
      expect(otherNavigationItems).toHaveProperty('items');
      expect(Array.isArray(otherNavigationItems.items)).toBe(true);
    });

    it('contains expected navigation items', () => {
      const itemIds = otherNavigationItems.items.map(item => item.id);
      expect(itemIds).toContain('settings');
      expect(itemIds).toContain('my-account');
    });

    it('has valid navigation item structure', () => {
      otherNavigationItems.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('icon');
        expect(typeof item.id).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(typeof item.path).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.path.length).toBeGreaterThan(0);
      });
    });

    it('has valid paths', () => {
      otherNavigationItems.items.forEach(item => {
        expect(item.path).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
      });
    });

    it('has React elements as icons', () => {
      otherNavigationItems.items.forEach(item => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('object');
        expect(item.icon).toHaveProperty('type');
      });
    });

    it('does not have submenus', () => {
      otherNavigationItems.items.forEach(item => {
        expect(item.submenu).toBeUndefined();
      });
    });
  });

  describe('versionInfo', () => {
    it('has correct structure', () => {
      expect(versionInfo).toHaveProperty('version');
      expect(versionInfo).toHaveProperty('badge');
      expect(versionInfo).toHaveProperty('icon');
    });

    it('has valid version string', () => {
      expect(typeof versionInfo.version).toBe('string');
      expect(versionInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('has valid badge structure', () => {
      expect(versionInfo.badge).toHaveProperty('text');
      expect(versionInfo.badge).toHaveProperty('variant');
      expect(typeof versionInfo.badge.text).toBe('string');
      expect(typeof versionInfo.badge.variant).toBe('string');
      expect(versionInfo.badge.text.length).toBeGreaterThan(0);
    });

    it('has valid badge variant', () => {
      const validVariants = ['new', 'soon', 'default'];
      expect(validVariants).toContain(versionInfo.badge.variant);
    });

    it('has React element as icon', () => {
      expect(versionInfo.icon).toBeDefined();
      expect(typeof versionInfo.icon).toBe('object');
      expect(versionInfo.icon).toHaveProperty('type');
    });

    it('has specific version and badge values', () => {
      expect(versionInfo.version).toBe('1.7.2');
      expect(versionInfo.badge.text).toBe('NEW');
      expect(versionInfo.badge.variant).toBe('new');
    });
  });

  describe('defaultUserProfile', () => {
    it('has correct structure', () => {
      expect(defaultUserProfile).toHaveProperty('name');
      expect(defaultUserProfile).toHaveProperty('email');
      expect(defaultUserProfile).toHaveProperty('avatar');
    });

    it('has valid user profile data', () => {
      expect(typeof defaultUserProfile.name).toBe('string');
      expect(typeof defaultUserProfile.email).toBe('string');
      expect(typeof defaultUserProfile.avatar).toBe('string');
      expect(defaultUserProfile.name.length).toBeGreaterThan(0);
      expect(defaultUserProfile.email.length).toBeGreaterThan(0);
      expect(defaultUserProfile.avatar.length).toBeGreaterThan(0);
    });

    it('has valid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(defaultUserProfile.email)).toBe(true);
    });

    it('has valid avatar URL', () => {
      expect(defaultUserProfile.avatar).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
    });

    it('has specific default values', () => {
      expect(defaultUserProfile.name).toBe('Emon Pixels');
      expect(defaultUserProfile.email).toBe('emon683@nogl.io');
      expect(defaultUserProfile.avatar).toBe('/api/placeholder/40/40');
    });
  });

  describe('Type Safety', () => {
    it('mainNavigationItems conforms to NavigationSection interface', () => {
      const section: NavigationSection = mainNavigationItems;
      expect(section).toBeDefined();
      expect(section.id).toBe('main');
      expect(section.title).toBe('');
      expect(Array.isArray(section.items)).toBe(true);
    });

    it('otherNavigationItems conforms to NavigationSection interface', () => {
      const section: NavigationSection = otherNavigationItems;
      expect(section).toBeDefined();
      expect(section.id).toBe('other');
      expect(section.title).toBe('');
      expect(Array.isArray(section.items)).toBe(true);
    });

    it('defaultUserProfile conforms to UserProfile interface', () => {
      const profile: UserProfile = defaultUserProfile;
      expect(profile).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.avatar).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('has unique item IDs within main navigation', () => {
      const ids = mainNavigationItems.items.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has unique item IDs within other navigation', () => {
      const ids = otherNavigationItems.items.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has unique submenu item IDs within each parent item', () => {
      const itemsWithSubmenus = mainNavigationItems.items.filter(item => item.submenu);
      
      itemsWithSubmenus.forEach(item => {
        const subIds = item.submenu!.map(sub => sub.id);
        const uniqueSubIds = new Set(subIds);
        expect(uniqueSubIds.size).toBe(subIds.length);
      });
    });

    it('has no duplicate paths across all items', () => {
      const allPaths = [
        ...mainNavigationItems.items.map(item => item.path),
        ...otherNavigationItems.items.map(item => item.path),
        ...mainNavigationItems.items
          .filter(item => item.submenu)
          .flatMap(item => item.submenu!.map(sub => sub.path)),
      ];
      
      const uniquePaths = new Set(allPaths);
      expect(uniquePaths.size).toBe(allPaths.length);
    });

    it('has consistent path structure', () => {
      const allItems = [
        ...mainNavigationItems.items,
        ...otherNavigationItems.items,
        ...mainNavigationItems.items
          .filter(item => item.submenu)
          .flatMap(item => item.submenu!),
      ];
      
      allItems.forEach(item => {
        expect(item.path).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
        expect(item.path).not.toMatch(/\/$/); // Should not end with slash
        expect(item.path).not.toMatch(/\/{2,}/); // Should not have double slashes
      });
    });
  });

  describe('Icon Validation', () => {
    it('all main navigation items have valid SVG icons', () => {
      mainNavigationItems.items.forEach(item => {
        expect(item.icon).toBeDefined();
        expect(item.icon.type).toBe('svg');
        expect(item.icon.props).toHaveProperty('width');
        expect(item.icon.props).toHaveProperty('height');
        expect(item.icon.props).toHaveProperty('viewBox');
      });
    });

    it('all other navigation items have valid SVG icons', () => {
      otherNavigationItems.items.forEach(item => {
        expect(item.icon).toBeDefined();
        expect(item.icon.type).toBe('svg');
        expect(item.icon.props).toHaveProperty('width');
        expect(item.icon.props).toHaveProperty('height');
        expect(item.icon.props).toHaveProperty('viewBox');
      });
    });

    it('version info has valid SVG icon', () => {
      expect(versionInfo.icon).toBeDefined();
      expect(versionInfo.icon.type).toBe('svg');
      expect(versionInfo.icon.props).toHaveProperty('width');
      expect(versionInfo.icon.props).toHaveProperty('height');
      expect(versionInfo.icon.props).toHaveProperty('viewBox');
    });

    it('all icons have consistent dimensions', () => {
      const allIcons = [
        ...mainNavigationItems.items.map(item => item.icon),
        ...otherNavigationItems.items.map(item => item.icon),
        versionInfo.icon,
      ];
      
      allIcons.forEach(icon => {
        expect(icon.props.width).toBe('20');
        expect(icon.props.height).toBe('20');
      });
    });
  });
});
