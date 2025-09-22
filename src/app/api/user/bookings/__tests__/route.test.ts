// import { NextResponse } from 'next/server';
// import { prisma } from "../../../../../libs/prismaDb";
// import { GET } from '../route';
// import 'whatwg-fetch';
// import { POST } from '../create/route';

// // Mock the Prisma client
// jest.mock('@/libs/prismaDb');

// // Mock the getServerSession function from next-auth
// jest.mock('next-auth/next', () => ({
//   getServerSession: jest.fn(),
// }));

// // Add these lines before your tests
// global.Response = class Response {
//   constructor(body?: any, init?: ResponseInit) {
//     return new (actual.Response as any)(body, init);
//   }
// } as any;

// const actual = jest.requireActual('next/server');

// describe('Bookings API', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return 401 when user is not authenticated', async () => {
//     const { getServerSession } = require('next-auth/next');
//     (getServerSession as jest.Mock).mockResolvedValue(null);

//     const response = await GET();
//     expect(response.status).toBe(401);
//     expect(await response.json()).toEqual({ error: 'Unauthorized' });
//   });

//   it('should return 404 when user email not found', async () => {
//     const { getServerSession } = require('next-auth/next');
//     (getServerSession as jest.Mock).mockResolvedValue({
//       user: { email: 'test@example.com' },
//     });

//     (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

//     const response = await GET();
//     expect(response.status).toBe(404);
//     expect(await response.json()).toEqual({ error: 'User not found' });
//   });

//   it('should return user bookings when authenticated', async () => {
//     const { getServerSession } = require('next-auth/next');
//     (getServerSession as jest.Mock).mockResolvedValue({
//       user: { id: 'test-user-id' },
//     });

//     const mockBookings = [
//       {
//         id: 'booking-1',
//         expertSession: {
//           id: 'session-1',
//           title: 'Test Session',
//           date: new Date('2024-03-20'),
//           startTime: new Date('2024-03-20T10:00:00'),
//           duration: 60,
//           timeZone: 'Europe/Berlin',
//         },
//       },
//     ];

//     (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

//     const response = await GET();
//     expect(response.status).toBe(200);

//     const data = await response.json();
//     expect(data).toEqual([
//       {
//         id: 'booking-1',
//         title: 'Test Session',
//         date: mockBookings[0].expertSession.date.toISOString(),
//         startTime: mockBookings[0].expertSession.startTime.toISOString(),
//         duration: 60,
//         timeZone: 'Europe/Berlin',
//       },
//     ]);
//   });

//   it('should handle database errors gracefully', async () => {
//     const { getServerSession } = require('next-auth/next');
//     (getServerSession as jest.Mock).mockResolvedValue({
//       user: { id: 'test-user-id' },
//     });

//     (prisma.booking.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

//     const response = await GET();
//     expect(response.status).toBe(500);
//     expect(await response.json()).toEqual({ error: 'Internal Server Error' });
//   });
// }); 