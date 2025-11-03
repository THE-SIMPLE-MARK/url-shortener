import { PrismaClient } from "prisma-generated/client"
import { nanoid } from "nanoid"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
	console.log("Clearing existing data...")

	const NUM_USERS = 10_000
	const URLS_PER_USER = 25
	const BATCH_SIZE = 500

	const totalBatches = Math.ceil(NUM_USERS / BATCH_SIZE)

	// clear existing data (optional, but good for consistent seeding)
	await prisma.url.deleteMany()
	await prisma.user.deleteMany()

	console.log("=== SEEDING START ===")
	const start = performance.now()

	console.log(`Generating ${NUM_USERS} unique names...`)
	const uniqueNames = faker.helpers.uniqueArray(
		() => faker.person.fullName(),
		NUM_USERS
	)

	console.log(
		`Creating ${NUM_USERS} users with ${URLS_PER_USER} URLs each in ${totalBatches} batches...\n`
	)
	for (let i = 0; i < NUM_USERS; i += BATCH_SIZE) {
		const currentBatchNum = i / BATCH_SIZE + 1

		const batchStartPerf = performance.now()
		console.log(`Starting batch ${currentBatchNum} of ${totalBatches}...`)

		const createOperations = []
		for (let j = 0; j < BATCH_SIZE && i + j < NUM_USERS; j++) {
			const name = uniqueNames[i + j]!

			const urlsData = []
			for (let k = 0; k < URLS_PER_USER; k++) {
				urlsData.push({
					originalUrl: faker.internet.url(),
					shortId: nanoid(),
				})
			}

			createOperations.push(
				prisma.user.create({
					data: {
						name: name,
						urls: {
							create: urlsData,
						},
					},
				})
			)
		}

		await prisma.$transaction(createOperations)

		const batchEndPerf = performance.now()
		console.log(
			`Finished batch ${currentBatchNum} of ${totalBatches} in ${batchEndPerf - batchStartPerf}ms!\n`
		)
	}

	console.log("=== SEEDING FINISHED ===")
	const end = performance.now()
	console.log(`Time taken: ${end - start}ms`)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
