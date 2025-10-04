export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  role: 'user',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockAdminUser = {
  id: '2',
  email: 'admin@example.com',
  name: 'Admin User',
  image: 'https://example.com/admin-avatar.jpg',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockUsers = [mockUser, mockAdminUser];

export const mockSession = {
  user: mockUser,
  expires: '2025-12-31T23:59:59.999Z',
};

export const mockAdminSession = {
  user: mockAdminUser,
  expires: '2025-12-31T23:59:59.999Z',
};
