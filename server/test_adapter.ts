import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const userCount = await prisma.user.count()
    console.log("SUCCESS! User count:", userCount)
  } catch (e: any) {
    console.error("FAILURE:", e.message)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
