const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;

async function main() {
    const messages = await prisma.message.deleteMany();
    console.log(messages);
}

main().catch(e => {
    console.log('prismajs error: ', e);
}).finally(() => {
    prisma.$disconnect();
})