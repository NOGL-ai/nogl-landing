import { PrismaClient, CompetitorStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded competitor data from the UI (28 competitors)
const COMPETITORS_DATA = [
  {
    name: 'Pilgrim',
    domain: 'pilgrim.net',
    productCount: 85,
    marketPosition: 25,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Watches'],
  },
  {
    name: 'Amoonic',
    domain: 'amoonic.de',
    productCount: 42,
    marketPosition: 78,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Cluse',
    domain: 'cluse.com',
    productCount: 65,
    marketPosition: 35,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Watches', 'Accessories'],
  },
  {
    name: 'Eastside',
    domain: 'eastsidewatches.com',
    productCount: 28,
    marketPosition: 88,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Watches', 'Luxury'],
  },
  {
    name: 'Engelssinn',
    domain: 'engelsinn.de',
    productCount: 38,
    marketPosition: 82,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'fejn',
    domain: 'fejn.com',
    productCount: 52,
    marketPosition: 65,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'float',
    domain: 'float.to',
    productCount: 15,
    marketPosition: 92,
    status: 'INACTIVE' as CompetitorStatus,
    categories: ['Inactive', 'Jewelry', 'Minimalist'],
  },
  {
    name: 'Golden Strawberry',
    domain: 'goldenstrawberry.de',
    productCount: 35,
    marketPosition: 85,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Heideman',
    domain: 'heideman-store.de',
    productCount: 48,
    marketPosition: 75,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Luxury'],
  },
  {
    name: 'Hey Happiness',
    domain: 'heyhappiness.com',
    productCount: 45,
    marketPosition: 80,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Jukserei',
    domain: 'jukserei.com',
    productCount: 22,
    marketPosition: 90,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Luamaya',
    domain: 'luamaya.com',
    productCount: 32,
    marketPosition: 88,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Nialaya',
    domain: 'nialaya.com',
    productCount: 28,
    marketPosition: 90,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Nonu Berlin',
    domain: 'nonu.shop',
    productCount: 42,
    marketPosition: 82,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Orelia',
    domain: 'orelia.co.uk',
    productCount: 95,
    marketPosition: 40,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Pico Kopenhagen',
    domain: 'picocopenhagen.com',
    productCount: 35,
    marketPosition: 85,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Purelei',
    domain: 'purelei.com',
    productCount: 58,
    marketPosition: 70,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Singaluru',
    domain: 'singularu.com',
    productCount: 18,
    marketPosition: 95,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'The Silver Collective',
    domain: 'thesilvercollective.com',
    productCount: 72,
    marketPosition: 60,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Silver'],
  },
  {
    name: 'Wunderklein',
    domain: 'wunderklein.com',
    productCount: 38,
    marketPosition: 80,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Bynouk',
    domain: 'bynouck.com',
    productCount: 25,
    marketPosition: 90,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Nana KAY',
    domain: 'nana-kay.com',
    productCount: 32,
    marketPosition: 88,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Rafaela Donata',
    domain: 'rafaela-donata.com',
    productCount: 15,
    marketPosition: 95,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Wanderlust + Co',
    domain: 'wanderlustandco.com',
    productCount: 88,
    marketPosition: 50,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Engelsrufer',
    domain: 'engelsrufer.de',
    productCount: 12,
    marketPosition: 98,
    status: 'INACTIVE' as CompetitorStatus,
    categories: ['Inactive', 'Jewelry', 'Fashion'],
  },
  {
    name: 'Makaro',
    domain: 'makarojewelry.com',
    productCount: 45,
    marketPosition: 75,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    name: 'Bruna The Label',
    domain: 'brunathelabel.com',
    productCount: 28,
    marketPosition: 88,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    name: 'PDPaola',
    domain: 'pdpaola.com',
    productCount: 125,
    marketPosition: 35,
    status: 'ACTIVE' as CompetitorStatus,
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
];

async function seedCompetitors() {
  console.log('🌱 Seeding competitors...');
  
  // Check if already seeded
  const existing = await prisma.competitor.count();
  if (existing > 0) {
    console.log(`⏭️  Skipping: ${existing} competitors already exist`);
    return;
  }

  // Upsert competitors (idempotent)
  for (const comp of COMPETITORS_DATA) {
    await prisma.competitor.upsert({
      where: { domain: comp.domain },
      update: {}, // Don't overwrite existing
      create: comp,
    });
  }

  console.log(`✅ Seeded ${COMPETITORS_DATA.length} competitors`);
}

async function seedPriceComparisons() {
  console.log('🌱 Seeding price comparisons...');
  
  const competitors = await prisma.competitor.findMany();
  
  // Generate sample price history for each competitor
  for (const comp of competitors) {
    // Check if price comparisons already exist
    const existingPrices = await prisma.competitorPriceComparison.count({
      where: { competitorId: comp.id },
    });

    if (existingPrices > 0) {
      console.log(`⏭️  Skipping price comparisons for ${comp.name} (${existingPrices} already exist)`);
      continue;
    }

    // Generate sample prices based on competitor data
    const basePrice = 30 + (comp.marketPosition || 50) * 0.3; // Price based on market position
    const myPrice = basePrice * 1.2; // My price is 20% higher

    const samplePrices = [
      { competitorPrice: basePrice * 0.9, myPrice: myPrice },
      { competitorPrice: basePrice * 0.95, myPrice: myPrice * 0.98 },
      { competitorPrice: basePrice * 1.05, myPrice: myPrice * 1.02 },
      { competitorPrice: basePrice * 0.88, myPrice: myPrice * 0.95 },
      { competitorPrice: basePrice * 1.1, myPrice: myPrice * 1.05 },
    ];

    for (const [index, price] of samplePrices.entries()) {
      await prisma.competitorPriceComparison.create({
        data: {
          competitorId: comp.id,
          competitorPrice: price.competitorPrice,
          myPrice: price.myPrice,
          priceDate: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)), // weekly intervals
          currency: 'EUR',
          trend: index > 0 ? (Math.random() - 0.5) * 10 : null, // Random trend
        },
      });
    }
  }

  console.log('✅ Seeded price comparisons');
}

async function main() {
  try {
    await seedCompetitors();
    await seedPriceComparisons();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
