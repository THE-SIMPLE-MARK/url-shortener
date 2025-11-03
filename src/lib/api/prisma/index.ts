import "server-only"

import { PrismaClient } from "prisma-generated/client"
import env from "~/env"

function createPrismaClient() {
	return new PrismaClient({
		log:
			env.NODE_ENV === "development"
				? ["error", "warn", "info", "query"]
				: ["error"],
	})
}

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()
export default prisma

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
