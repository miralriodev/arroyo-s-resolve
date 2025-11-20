require('dotenv').config()
const { PrismaClient, Prisma } = require('@prisma/client')

const prisma = new PrismaClient()

async function run() {
  try {
    const acc = await prisma.accommodation.findFirst({})
    if (!acc) {
      console.error('No hay alojamientos para probar la reserva')
      process.exitCode = 1
      return
    }
    const start = new Date()
    const end = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const booking = await prisma.booking.create({
      data: {
        accommodationId: acc.id,
        start_date: start,
        end_date: end,
        guests: 1,
        amount: new Prisma.Decimal('100.00'),
        status: 'pending',
      },
    })
    console.log('Reserva de prueba creada:', booking.id)
    // Limpieza: elimina la reserva de prueba
    await prisma.booking.delete({ where: { id: booking.id } })
    console.log('Reserva de prueba eliminada:', booking.id)
  } catch (err) {
    console.error('Fallo al crear reserva de prueba:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()