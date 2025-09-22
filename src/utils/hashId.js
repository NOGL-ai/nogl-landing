const { PrismaClient } = require('@prisma/client');
const { createHash } = require('crypto');

const prisma = new PrismaClient();

function encodeId(id) {
  return createHash('sha256')
    .update(`${id}-${process.env.HASH_SECRET}`)
    .digest('hex')
    .slice(0, 12);
}

async function getAllHashedSessionIds() {
  const sessions = await prisma.expertSession.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  return sessions.map(session => ({
    hashedId: encodeId(session.id),
    lastmod: session.updatedAt.toISOString(),
  }));
}

module.exports = {
  getAllHashedSessionIds
}; 