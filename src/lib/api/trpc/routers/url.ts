import { z } from "zod"
import { nanoid } from "nanoid"

import { createTRPCRouter } from "~/lib/api/trpc"
import { publicProcedure } from "~/lib/api/trpc/procedures/public"
import prisma from "~/lib/api/prisma"

export const urlRouter = createTRPCRouter({
	getUserByName: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.query(async ({ input }) => {
			const user = await prisma.user.findUnique({
				where: { name: input.name },
				include: { urls: true },
			})
			return user
		}),

	createUser: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return prisma.user.create({
				data: {
					name: input.name,
				},
			})
		}),

	createUrl: publicProcedure
		.input(
			z.object({
				originalUrl: z.string().url(),
				creatorId: z.int(),
			})
		)
		.mutation(async ({ input }) => {
			let shortId = nanoid(10)

			// iterate until we find a unique shortId
			let existing = await prisma.url.findUnique({
				where: { shortId },
			})
			while (existing) {
				shortId = nanoid(10)
				existing = await prisma.url.findUnique({
					where: { shortId },
				})
			}

			return prisma.url.create({
				data: {
					shortId,
					originalUrl: input.originalUrl,
					creatorId: input.creatorId,
				},
			})
		}),

	getUserUrls: publicProcedure
		.input(z.object({ userName: z.string() }))
		.query(async ({ input }) => {
			return prisma.url.findMany({
				where: { creator: { name: input.userName } },
				orderBy: { createdAt: "desc" },
			})
		}),

	deleteUrl: publicProcedure
		.input(z.object({ urlId: z.int() }))
		.mutation(async ({ input }) => {
			return prisma.url.delete({
				where: { id: input.urlId },
			})
		}),
})
