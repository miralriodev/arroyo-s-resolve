const prisma = require('../config/prismaClient')

async function run() {
  try {
    // Añade columnas de pago si no existen
    await prisma.$executeRawUnsafe(
      "ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_confirmed_by_host boolean DEFAULT false;"
    )
    await prisma.$executeRawUnsafe(
      "ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;"
    )
    console.log('Payment columns ensured on public.bookings')
  } catch (err) {
    console.error('Failed to add payment columns:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()