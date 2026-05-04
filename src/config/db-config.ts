import debug from 'debug';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.ts';

const log = debug(`${process.env.PROJECT_NAME}:configDB`);
log('Loading database connection...');

export const connectDB = async (): Promise<PrismaClient> => {
    const adapter = new PrismaPg({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
    });

    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        log('Database connection established successfully');
        const [info] = (await prisma.$queryRaw`SELECT current_database()`) as {
            current_database: string;
        }[];
        log('Connected to DB:', info?.current_database);
        prisma.$disconnect();
    } catch (error) {
        log('Error connecting to DB ->', error);
        throw error;
    }

    return prisma;
};
