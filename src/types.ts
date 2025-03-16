// #region Imports

import { z } from "zod"

// #endregion Imports



export const specialOffer_schema = z.strictObject({
	title: z.string(),
	link: z.string().url(),
	leaseLength: z.string(),
	availability: z.string(),
	fuelType: z.string()
})
export type SpecialOffer = z.infer<typeof specialOffer_schema>