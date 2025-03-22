// #region Imports

import env from "../../env"
import { OfferSet, Result } from "../types"
import { createTransport } from "./mail-transport"
import makeOffersMail from "./html/new-offers"

// #endregion Imports



// #region Consts

export const usingMailAlerts = (
	// In production
	env.MODE === "PROD" &&

	// Auth credentials set
	typeof env.ALERTER_EMAIL_USER === "string" &&
	typeof env.ALERTER_EMAIL_PASS === "string" &&
	typeof env.ALERTER_RECIPIENT === "string"
)

// #endregion Consts



// Create in global scope because creation takes very long
const transportCreation = usingMailAlerts
	? await createTransport() 
	: { success: false, error: "Not using mail alerts" } as const



// #region Main

export const alertToOffers = async (
	deleted: OfferSet = new Set(),
	added: OfferSet = new Set()
): Promise<Result<string>> => {
	
	// Checks for early returns
	if (!usingMailAlerts) return {
		result: "Not using mail alerts",
		success: true
	}
	if (!transportCreation.success) return {
		result: null,
		success: false,
		error: `Could not create transport: ${transportCreation.error}`
	}


	// Filter offers
	const filteredOffers = filter(added)
	if (filteredOffers.size < 1) return {
		result: "No offers to alert to",
		success: true
	}
	console.info(`Alerting recipients to: ${filteredOffers.size} new offer(s)`)


	// Get transport
	const transport = transportCreation.result

	// Get html
	const makeMailHtml = await makeOffersMail(filteredOffers)
	if (!makeMailHtml.success) return {
		result: null,
		success: false,
		error: `Could not compile mail html: ${makeMailHtml.error}`
	}

	// Get subject
	const subject = `${filteredOffers.size} New Offer${filteredOffers.size === 1 ? "" : "s"} - Fleet Solutions Scraper`


	// Send mail
	const sentMail = await transport.sendMail({
		to: env.ALERTER_RECIPIENT,
		from: env.ALERTER_EMAIL_USER,
		subject: subject,
		html: makeMailHtml.result
	})

	// Return success
	return {
		result: "Mail sent",
		success: true,
	}
}

// #endregion Main



// #region Filters

/** Return a set after filtering */
const filter = (offers: OfferSet): OfferSet => {

	// Create a new set to not modify the original
	const filtered: OfferSet = new Set()
	
	// Iterate over set
	for (const offer of offers) {
		// Filters
		if (offer.fuelType !== "Electric") continue

		// Add to filtered set
		filtered.add(offer)
	}

	// Return filtered offers
	return filtered
}

// #endregion Filters