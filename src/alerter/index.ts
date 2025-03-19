// #region Imports

import env from "../../env"
import { OfferSet } from "../types"
import { createTransport } from "./mail"
import { compileHtml as offersHtml } from "./html/new-offers"

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



// Create in global scope because creation takes wayyy too long
const transportCreation = await createTransport()



// #region Main

export const alertToOffers = async (
	deleted: OfferSet = new Set(),
	added: OfferSet = new Set()
) => {
	if (!usingMailAlerts) return
	if (!transportCreation.success) return


	// Get transport
	const transport = transportCreation.result

	// Send mail
	await transport.sendMail({
		to: env.ALERTER_RECIPIENT,
		from: env.ALERTER_EMAIL_USER,
		subject: "New Offers - Fleet Solutions Scraper",
		html: await offersHtml(added)
	})
}

// #endregion Main