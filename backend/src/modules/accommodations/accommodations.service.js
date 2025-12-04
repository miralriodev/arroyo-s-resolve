import prisma from '../../config/prismaClient.js';
import { Prisma } from '@prisma/client';

export const search = async (q) => {
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

export const getById = async (id) => {
  const acc = await prisma.accommodation.findUnique({
    where: { id },
    include: { images: true, host: { select: { id: true, full_name: true, avatar_url: true, role: true } } },
  });
  if (!acc || !acc.host) return acc;
  try {
    const [row] = await prisma.$queryRawUnsafe(`SELECT host_title, host_bio, languages, years_experience, response_rate, response_time, superhost, city, contact_email, phone FROM public.profiles WHERE id = '${acc.host.id}'`);
    if (row) {
      acc.host = { ...acc.host, ...row };
    }
  } catch (_) {}
  return acc;
};

export const create = async (hostId, payload) => {
  const price = payload.price !== undefined && payload.price !== null
    ? new Prisma.Decimal(String(payload.price))
    : new Prisma.Decimal('0');
  if (payload.category) {
    const cat = await prisma.category.findUnique({ where: { key: payload.category } });
    if (!cat) {
      const err = new Error('Categoría inválida');
      err.status = 400;
      throw err;
    }
  }
  const created = await prisma.accommodation.create({
    data: {
      host: hostId ? { connect: { id: hostId } } : undefined,
      title: payload.title,
      description: payload.description,
      price,
      category: payload.category || null,
      location: payload.location,
      image_url: payload.image_url,
      property_type: payload.property_type,
      amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
      instant_book: payload.instant_book === true,
      max_guests: payload.max_guests || 1,
    },
  });
  if (Array.isArray(payload.images) && payload.images.length) {
    const items = payload.images.map((url, idx) => ({ accommodationId: created.id, url, sort_order: idx }))
    await prisma.accommodationImage.createMany({ data: items })
  }
  return prisma.accommodation.findUnique({ where: { id: created.id }, include: { images: true } })
};

export const update = async (hostId, id, payload) => {
  const acc = await prisma.accommodation.findUnique({ where: { id } });
  if (!acc || acc.hostId !== hostId) throw new Error('No autorizado o no existe');
  const price = payload.price !== undefined && payload.price !== null
    ? new Prisma.Decimal(String(payload.price))
    : undefined;
  if (payload.category) {
    const cat = await prisma.category.findUnique({ where: { key: payload.category } });
    if (!cat) {
      const err = new Error('Categoría inválida');
      err.status = 400;
      throw err;
    }
  }
  return prisma.accommodation.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      price,
      category: payload.category || null,
      location: payload.location,
      image_url: payload.image_url,
      property_type: payload.property_type,
      amenities: payload.amenities,
      instant_book: payload.instant_book === true,
      max_guests: payload.max_guests,
      updated_at: new Date(),
    },
  });
};

export const getAvailability = async (id, q) => {
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

export const setAvailability = async (hostId, id, body) => {
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
