const prisma = require('../config/prismaClient')

async function run() {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guests integer NOT NULL DEFAULT 1;'
    )
    console.log('Column guests ensured on public.bookings')
  } catch (err) {
    console.error('Failed to add guests column:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()