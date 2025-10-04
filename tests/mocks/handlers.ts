import { http, HttpResponse } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2025-12-31T23:59:59.999Z',
    });
  }),

  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2025-12-31T23:59:59.999Z',
    });
  }),

  // User endpoints
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
  }),

  http.put('/api/user', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Updated User',
      image: 'https://example.com/avatar.jpg',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
  }),

  // API Key endpoints
  http.get('/api/api-keys', () => {
    return HttpResponse.json({
      apiKeys: [
        {
          id: '1',
          name: 'Test API Key',
          key: 'sk_test_1234567890',
          createdAt: '2025-01-01T00:00:00.000Z',
          lastUsed: '2025-01-01T00:00:00.000Z',
        },
      ],
    });
  }),

  http.post('/api/api-keys', () => {
    return HttpResponse.json({
      id: '2',
      name: 'New API Key',
      key: 'sk_test_0987654321',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  }),

  http.delete('/api/api-keys/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // Upload endpoints
  http.post('/api/upload', () => {
    return HttpResponse.json({
      url: 'https://example.com/uploaded-file.jpg',
      filename: 'uploaded-file.jpg',
      size: 1024,
    });
  }),

  // Error handlers
  http.get('/api/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/not-found', () => {
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }),

  http.get('/api/unauthorized', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // External API mocks
  http.get('https://api.external-service.com/data', () => {
    return HttpResponse.json({
      data: 'External API response',
    });
  }),

  // Stripe webhook mock
  http.post('/api/stripe/webhook', () => {
    return HttpResponse.json({ received: true });
  }),

  // Ghost CMS API mock
  http.get('https://ghost.example.com/ghost/api/content/posts', () => {
    return HttpResponse.json({
      posts: [
        {
          id: '1',
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'This is a test post',
          published_at: '2025-01-01T00:00:00.000Z',
          feature_image: 'https://example.com/image.jpg',
        },
      ],
    });
  }),
];
