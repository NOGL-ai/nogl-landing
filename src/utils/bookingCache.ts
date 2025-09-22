export type BookingState = 'PAST' | 'READY_TO_JOIN' | 'UPCOMING' | 'AVAILABLE' | 'BOOKED';

export const BookingCache = {
  bookedSessions: new Set<string>(),
  
  init(bookings: any[]) {
    this.bookedSessions = new Set(
      bookings
        .filter(b => b.status === 'confirmed' || b.status === 'ready_to_join')
        .map(b => b.id)
    );
  },

  isBooked(sessionId: string): boolean {
    return this.bookedSessions.has(sessionId);
  }
}; 