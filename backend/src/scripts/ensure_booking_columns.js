const prisma = require('../config/prismaClient')

async function run() {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;'
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS rejected_at timestamptz;'
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_confirmed_by_host boolean DEFAULT false;'
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;'
    )
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guests integer NOT NULL DEFAULT 1;'
    )
    console.log('All Booking columns ensured on public.bookings')
  } catch (err) {
    console.error('Failed to ensure Booking columns:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()