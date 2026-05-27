import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
//建立连接
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//从 .env读取数据库的地址 建立连接

//把连接包装成prisma认识的格式
const adapter = new PrismaPg(pool);

//单例模式
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

//已经有了就用旧的，没有才去建立新的
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

//开发环境存到全局
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
