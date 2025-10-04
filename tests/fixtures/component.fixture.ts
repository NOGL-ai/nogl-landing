import { ReactElement } from 'react';

// Mock component props for testing
export const mockButtonProps = {
  children: 'Click me',
  onClick: vi.fn(),
  variant: 'primary' as const,
  size: 'md' as const,
  disabled: false,
  loading: false,
};

export const mockInputProps = {
  label: 'Email',
  placeholder: 'Enter your email',
  type: 'email' as const,
  value: '',
  onChange: vi.fn(),
  error: '',
  required: true,
};

export const mockFormProps = {
  onSubmit: vi.fn(),
  initialValues: {
    email: '',
    password: '',
  },
  validationSchema: {},
};

export const mockCardProps = {
  title: 'Test Card',
  description: 'This is a test card',
  image: 'https://example.com/image.jpg',
  onClick: vi.fn(),
};

export const mockModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Test Modal',
  children: 'Modal content',
};

export const mockDropdownProps = {
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  value: 'option1',
  onChange: vi.fn(),
  placeholder: 'Select an option',
};

// Mock data for testing
export const mockBlogPost = {
  id: '1',
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog post excerpt',
  content: 'This is the full content of the test blog post.',
  author: {
    name: 'Test Author',
    image: 'https://example.com/author.jpg',
  },
  publishedAt: '2025-01-01T00:00:00.000Z',
  featureImage: 'https://example.com/feature-image.jpg',
  tags: ['test', 'blog', 'example'],
};

export const mockBlogPosts = [mockBlogPost];

export const mockTestimonial = {
  id: '1',
  name: 'John Doe',
  role: 'CEO',
  company: 'Test Company',
  content: 'This is a great product!',
  image: 'https://example.com/testimonial.jpg',
  rating: 5,
};

export const mockTestimonials = [mockTestimonial];

export const mockFeature = {
  id: '1',
  title: 'Test Feature',
  description: 'This is a test feature description',
  icon: 'test-icon',
  image: 'https://example.com/feature.jpg',
};

export const mockFeatures = [mockFeature];

// Mock navigation items
export const mockNavigationItems = [
  {
    name: 'Home',
    href: '/',
    current: true,
  },
  {
    name: 'About',
    href: '/about',
    current: false,
  },
  {
    name: 'Contact',
    href: '/contact',
    current: false,
  },
];

// Mock sidebar items
export const mockSidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    current: true,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
    current: false,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: 'profile',
    current: false,
  },
];
