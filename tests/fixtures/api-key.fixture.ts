export const mockApiKey = {
  id: '1',
  name: 'Test API Key',
  key: 'sk_test_1234567890abcdef',
  userId: '1',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastUsed: '2025-01-01T00:00:00.000Z',
  isActive: true,
};

export const mockApiKeys = [
  mockApiKey,
  {
    id: '2',
    name: 'Production API Key',
    key: 'sk_live_0987654321fedcba',
    userId: '1',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastUsed: '2025-01-02T00:00:00.000Z',
    isActive: true,
  },
  {
    id: '3',
    name: 'Inactive API Key',
    key: 'sk_test_inactive123456',
    userId: '1',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastUsed: null,
    isActive: false,
  },
];

export const mockCreateApiKeyRequest = {
  name: 'New API Key',
};

export const mockCreateApiKeyResponse = {
  id: '4',
  name: 'New API Key',
  key: 'sk_test_newkey123456789',
  userId: '1',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastUsed: null,
  isActive: true,
};
