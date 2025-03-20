// #region Imports

import { z } from "zod"

// #endregion Imports



// #region Offers

export const Offer = z.strictObject({
	title: z.string(),
	link: z.string().url(),
	leaseLength: z.string(),
	availability: z.string(),
	fuelType: z.string()
})
export type Offer = z.infer<typeof Offer>

export const OfferSet = z.set(Offer)
export type OfferSet = z.infer<typeof OfferSet>

export const OfferMap = z.map(z.string(), Offer)
export type OfferMap = z.infer<typeof OfferMap>

// #endregion Offers



// #region Auth

export const Auth = z.strictObject({
	PHPSESSID: z.string()
})
export type Auth = z.infer<typeof Auth>

// #endregion Auth



// #region General

export type Result <T extends unknown> = {
	result: T,
	success: true
} | {
	result: null,
	success: false,
	error: unknown
}

// #endregion General