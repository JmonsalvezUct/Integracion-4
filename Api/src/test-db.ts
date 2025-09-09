import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión a la base de datos exitosa');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error);
  }
}

testConnection();