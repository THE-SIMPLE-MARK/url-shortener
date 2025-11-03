import prisma from "~/lib/api/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ shortId: string }> }
) {
	const { shortId } = await params

	const url = await prisma.url.findUnique({
		where: { shortId },
	})

	if (!url) return notFound()

	return Response.redirect(url.originalUrl)
}
