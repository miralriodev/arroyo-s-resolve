require('dotenv').config();
const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding datos de desarrollo...');

  // Categorías básicas
  const categories = [
    { key: 'beach', label: 'Playa' },
    { key: 'mountain', label: 'Montaña' },
    { key: 'city', label: 'Ciudad' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { key: cat.key },
      update: { label: cat.label },
      create: cat,
    });
  }
  console.log(`Categorías listas: ${categories.map(c => c.key).join(', ')}`);

  // Alojamiento 1
  const acc1 = await prisma.accommodation.create({
    data: {
      title: 'Casa cerca de la playa',
      description: 'Alojamiento luminoso a 5 min de la costa.',
      price: new Prisma.Decimal('120.00'),
      rating: new Prisma.Decimal('4.5'),
      category: 'beach',
      location: 'Arroyo Seco',
      image_url: 'https://picsum.photos/seed/playa/800/600',
      property_type: 'house',
      amenities: ['wifi', 'parking', 'kitchen'],
      max_guests: 4,
    },
  });

  await prisma.accommodationImage.createMany({
    data: [
      { accommodationId: acc1.id, url: 'https://picsum.photos/seed/playa1/800/600', sort_order: 0 },
      { accommodationId: acc1.id, url: 'https://picsum.photos/seed/playa2/800/600', sort_order: 1 },
    ],
  });

  // Disponibilidad del alojamiento 1 (próximos 5 días)
  const today = new Date();
  const avail1 = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    avail1.push({ accommodationId: acc1.id, date: d, capacity: 2 });
  }
  await prisma.availability.createMany({ data: avail1 });

  // Alojamiento 2
  const acc2 = await prisma.accommodation.create({
    data: {
      title: 'Cabaña en la montaña',
      description: 'Ideal para desconectar y disfrutar de la naturaleza.',
      price: new Prisma.Decimal('85.00'),
      rating: new Prisma.Decimal('4.7'),
      category: 'mountain',
      location: 'Sierra Nevada',
      image_url: 'https://picsum.photos/seed/montana/800/600',
      property_type: 'cabin',
      amenities: ['wifi', 'fireplace'],
      max_guests: 2,
    },
  });

  await prisma.accommodationImage.createMany({
    data: [
      { accommodationId: acc2.id, url: 'https://picsum.photos/seed/montana1/800/600', sort_order: 0 },
      { accommodationId: acc2.id, url: 'https://picsum.photos/seed/montana2/800/600', sort_order: 1 },
    ],
  });

  const avail2 = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    avail2.push({ accommodationId: acc2.id, date: d, capacity: 1 });
  }
  await prisma.availability.createMany({ data: avail2 });

  console.log('Seed completado:', { acc1: acc1.id, acc2: acc2.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });