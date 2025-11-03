// re-export all client **types** only
export type * from "prisma-generated/client"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - re-export so we still get actual enums
export * from "prisma-generated/enums"
