// #region Imports

import { z } from "zod"

// #endregion Imports



export const SpecialOffer = z.strictObject({
	title: z.string(),
	link: z.string().url(),
	leaseLength: z.string(),
	availability: z.string(),
	fuelType: z.string()
})
export type SpecialOffer = z.infer<typeof SpecialOffer>


export const Auth = z.strictObject({
	PHPSESSID: z.string()
})
export type Auth = z.infer<typeof Auth>