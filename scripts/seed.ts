import { PrismaClient } from "prisma-generated/client"
import { nanoid } from "nanoid"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
	const NUM_USERS = 30_000
	const URLS_PER_USER = 50
	const BATCH_SIZE = 5000

	console.log("=== SEEDING START ===")
	const overallStart = performance.now()

	// clean up
	console.log("Clearing existing data...")
	const cleanStart = performance.now()
	await prisma.url.deleteMany()
	await prisma.user.deleteMany()
	const cleanEnd = performance.now()
	console.log(`Data cleared in ${cleanEnd - cleanStart}ms!`)

	// generate names
	console.log(`\nGenerating ${NUM_USERS} unique names...`)
	const nameStart = performance.now()
	const uniqueNames = faker.helpers.uniqueArray(
		faker.person.fullName.bind(faker.person),
		NUM_USERS
	)
	const nameEnd = performance.now()
	console.log(`Names generated in ${nameEnd - nameStart}ms!`)

	// create users
	console.log(`\nCreating ${NUM_USERS} users...`)
	const userCreateStart = performance.now()
	await prisma.user.createMany({
		data: uniqueNames.map(name => ({ name })),
	})
	const userCreateEnd = performance.now()
	console.log(`Users created in ${userCreateEnd - userCreateStart}ms!`)

	// fetch user IDs
	console.log(`\nFetching ${NUM_USERS} user IDs...`)
	const idFetchStart = performance.now()
	const users = await prisma.user.findMany({ select: { id: true } })
	const idFetchEnd = performance.now()
	console.log(`User IDs fetched in ${idFetchEnd - idFetchStart}ms!`)

	// generate URL data
	console.log(`\nGenerating ${NUM_USERS * URLS_PER_USER} URL records...`)
	const urlGenStart = performance.now()
	const urlData = users.flatMap(user =>
		Array.from({ length: URLS_PER_USER }, () => ({
			creatorId: user.id,
			originalUrl: faker.internet.url(),
			shortId: nanoid(),
		}))
	)
	const urlGenEnd = performance.now()
	console.log(`URL data generated in ${urlGenEnd - urlGenStart}ms!`)

	// insert URLs in batches
	console.log(`\nInserting URLs in batches of ${BATCH_SIZE}...`)
	const totalBatches = Math.ceil(urlData.length / BATCH_SIZE)
	let totalUrlInsertTime = 0

	for (let i = 0; i < urlData.length; i += BATCH_SIZE) {
		const batchNum = Math.floor(i / BATCH_SIZE) + 1
		const batchStart = performance.now()
		const batchData = urlData.slice(i, i + BATCH_SIZE)

		await prisma.url.createMany({
			data: batchData,
		})

		const batchEnd = performance.now()
		const batchTime = batchEnd - batchStart
		totalUrlInsertTime += batchTime

		console.log(
			`  Batch ${batchNum}/${totalBatches} (${batchData.length} rows): ${batchTime}ms`
		)
	}

	console.log(`All URLs inserted in ${totalUrlInsertTime}ms!`)

	const overallEnd = performance.now()
	const totalTime = overallEnd - overallStart

	console.log("\n=== SEEDING FINISHED ===")
	console.log(`\nTimings breakdown:`)
	console.log(`  Name generation:  ${nameEnd - nameStart}ms`)
	console.log(`  User creation:    ${userCreateEnd - userCreateStart}ms`)
	console.log(`  ID fetching:      ${idFetchEnd - idFetchStart}ms`)
	console.log(`  URL generation:   ${urlGenEnd - urlGenStart}ms`)
	console.log(`  URL insertion:    ${totalUrlInsertTime}ms`)
	console.log(`  --------------------------------`)
	console.log(`  Total:            ${totalTime}ms`)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
