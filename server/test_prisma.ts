import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

try {
  const p1 = new PrismaClient({ log: ['info'] })
  console.log("p1 created with log")
} catch (e) {
  console.error("p1 err:", e.message)
}

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const p2 = new PrismaClient({ adapter })
  console.log("p2 created with adapter (success!)")
  
  // Test query
  p2.$connect().then(() => {
    console.log("p2 connected successfully")
    return p2.user.count()
  }).then(count => {
    console.log("User count:", count)
  }).catch(err => {
    console.error("Query failed:", err.message)
  }).finally(() => {
    p2.$disconnect()
  })
} catch (e) {
  console.error("p2 err:", e.message)
}

