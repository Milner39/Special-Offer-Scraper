// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import puppeteer, { LaunchOptions } from "puppeteer-core"
import type { SpecialOffer } from "../.d.ts"

// #endregion Imports



const actualSite = "https://www.nhsfleetsolutions.co.uk/special-offers"

const siteURL = env.MODE === "PROD"
	? actualSite
	: fileURLToPath(new URL("../test-page/special-offers.html", import.meta.url))

const launchOptions = {
	headless: !(env.MODE === "TEST"),
	channel: "chrome"
} satisfies LaunchOptions



// Parse site
export const parse = async () => {
	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch(launchOptions)

	// Open page with regular sizing
	const [page] = await browser.pages()
	await page.setViewport({width: 1080, height: 1024})

	// Go to special offers page
	await page.goto(siteURL)

	// Get div containing offers
	const grid = await page.$(".special-offers-cols.special-offers-grid")

	// Get all offer details
	const items: SpecialOffer[] = await grid?.$$eval("#single-special", (elements,
		[actualSite]
	) => {
		// Subroutine to trim whitespace
		const trimWS = (str: string) => str
			.trim()
			.replace(/\s+/g, " ")

		// Parse details for every special offer element found in the DOM
		return elements.map(el => {
			const content = el.querySelector(".special-offer-content")
			return {
				title: trimWS(content
					?.querySelector(".car-title")
					?.innerHTML 
					|| ""
				),
				link: actualSite + (el
					.querySelector("a")
					?.getAttribute("href")
					|| ""
				),
				leaseLength: trimWS(content
					?.querySelector(".tr_lease-length + *")
					?.innerHTML
					|| ""
				),
				availability: trimWS(content
					?.querySelector(".tr_availability + *")
					?.innerHTML
					|| ""
				),

				// NOTE: The developers behind this website made a spelling mistake,
				// so at the time of writing, this is the work around... lol
				fuelType: trimWS(content
					?.querySelector('[classs="tr_fuel-type notranslate"] + *')
					?.innerHTML
					|| ""
				)
			} satisfies SpecialOffer
		})
	}, [actualSite] as const) || []

	// Close the browser
	await browser.close()

	// Return parsed offers
	return items
}