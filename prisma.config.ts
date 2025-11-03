import "dotenv/config" // TODO: use t3 env somehow?
import type { PrismaConfig } from "prisma"

export default {
	schema: "src/lib/api/prisma/schema",
} satisfies PrismaConfig
