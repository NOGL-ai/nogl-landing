// import { prisma } from "@/libs/prismaDb";
// import { NextResponse } from "next/server";
// import { isAuthorized } from "@/libs/isAuthorized";

// export async function POST(
//   request: Request,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const user = await isAuthorized();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const session = await prisma.expertSession.findUnique({
//       where: { id: params.sessionId },
//     });

//     if (!session) {
//       return NextResponse.json(
//         { error: "Session not found" },
//         { status: 404 }
//       );
//     }

//     if (session.bookedSpots >= session.maxParticipants) {
//       return NextResponse.json(
//         { error: "Session is fully booked" },
//         { status: 400 }
//       );
//     }

//     const reservation = await prisma.reservation.create({
//       data: {
//         userId: user.id,
//         sessionId: params.sessionId,
//         status: 'CONFIRMED',
//       },
//     });

//     await prisma.expertSession.update({
//       where: { id: params.sessionId },
//       data: {
//         bookedSpots: { increment: 1 },
//       },
//     });

//     return NextResponse.json(reservation);
//   } catch (error) {
//     console.error("[SESSION_RESERVE]", error);
//     return NextResponse.json(
//       { error: "Internal error" },
//       { status: 500 }
//     );
//   }
// } 