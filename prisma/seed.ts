import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            password,
            role: 'ADMIN',
        },
    })

    const moderator = await prisma.user.upsert({
        where: { email: 'moderator@gmail.com' },
        update: {},
        create: {
            email: 'moderator@gmail.com',
            password,
            role: 'MODERATOR',
        },
    })

    console.log({ admin, moderator })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
