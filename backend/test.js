const { PrismaClient } = require('@prisma/client');
try {
    const prisma = new PrismaClient({ errorFormat: 'minimal' });
    console.log("Success!");
} catch (e) {
    console.error(e);
}
