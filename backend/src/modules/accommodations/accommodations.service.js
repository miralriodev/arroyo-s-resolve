const prisma = require('../../config/prismaClient');

exports.search = async (q) => {
  const {
    location,
    minPrice,
    maxPrice,
    property_type,
    amenities, // CSV: wifi,kitchen,pool
    startDate,
    endDate,
    guests,
    category,
  } = q;

  const where = {};
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (category) where.category = { equals: category };
  if (property_type) where.property_type = { equals: property_type };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (amenities) {
    const list = amenities.split(',').map(a => a.trim()).filter(Boolean);
    // amenities es String[] en Postgres; Prisma soporta hasEvery
    if (list.length) where.amenities = { hasEvery: list };
  }
  if (guests) where.max_guests = { gte: Number(guests) };

  const accommodations = await prisma.accommodation.findMany({
    where,
    include: { images: true },
    orderBy: { created_at: 'desc' },
  });

  // Filtrado por disponibilidad si hay rango de fechas
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayMs = 86400000;

    const eligible = [];
    for (const acc of accommodations) {
      const avail = await prisma.availability.findMany({
        where: { accommodationId: acc.id, date: { gte: start, lte: end } },
      });
      const allDaysCovered = [];
      for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
        const row = avail.find(a => a.date.toDateString() === d.toDateString());
        const needGuests = guests ? Number(guests) : 1;
        if (!row || (row.capacity - row.reserved) < needGuests) {
          allDaysCovered.push(false);
        } else {
          allDaysCovered.push(true);
        }
      }
      if (allDaysCovered.every(Boolean)) eligible.push(acc);
    }
    return eligible;
  }

  return accommodations;
};

exports.getById = async (id) => {
  return prisma.accommodation.findUnique({
    where: { id },
    include: {
      images: true,
      host: { select: { id: true, full_name: true, avatar_url: true, role: true } },
    },
  });
};

exports.create = async (hostId, payload) => {
  return prisma.accommodation.create({
    data: {
      hostId,
      title: payload.title,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      location: payload.location,
      image_url: payload.image_url,
      property_type: payload.property_type,
      amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
      max_guests: payload.max_guests || 1,
    },
  });
};

exports.update = async (hostId, id, payload) => {
  const acc = await prisma.accommodation.findUnique({ where: { id } });
  if (!acc || acc.hostId !== hostId) throw new Error('No autorizado o no existe');
  return prisma.accommodation.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      location: payload.location,
      image_url: payload.image_url,
      property_type: payload.property_type,
      amenities: payload.amenities,
      max_guests: payload.max_guests,
      updated_at: new Date(),
    },
  });
};

exports.getAvailability = async (id, q) => {
  const { startDate, endDate } = q;
  const where = { accommodationId: id };
  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(endDate) };
  }
  return prisma.availability.findMany({
    where,
    orderBy: { date: 'asc' },
  });
};

exports.setAvailability = async (hostId, id, body) => {
  const acc = await prisma.accommodation.findUnique({ where: { id } });
  if (!acc || acc.hostId !== hostId) throw new Error('No autorizado o no existe');

  // body: [{ date: '2025-12-24', capacity: 2 }, ...]
  const payloads = Array.isArray(body) ? body : [body];
  const results = [];
  for (const item of payloads) {
    const date = new Date(item.date);
    const capacity = Number(item.capacity) || 1;
    const existing = await prisma.availability.findUnique({
      where: { accommodationId_date: { accommodationId: id, date } },
    });
    if (existing) {
      const updated = await prisma.availability.update({
        where: { accommodationId_date: { accommodationId: id, date } },
        data: { capacity },
      });
      results.push(updated);
    } else {
      const created = await prisma.availability.create({
        data: { accommodationId: id, date, capacity },
      });
      results.push(created);
    }
  }
  return results;
};