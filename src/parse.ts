// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import puppeteer, { LaunchOptions } from "puppeteer-core"

// #endregion Imports



const launchOptions = {
	headless: !(env.MODE === "TEST"),
	channel: "chrome"
} satisfies LaunchOptions

const siteURL = env.MODE === "PROD"
	? "https://www.nhsfleetsolutions.co.uk/special-offers/"
	: fileURLToPath(new URL("../test-page/special-offers.html", import.meta.url))



const parse = async () => {
	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch(launchOptions)

	// Open page with regular sizing
	const page = await browser.newPage()
	await page.setViewport({width: 1080, height: 1024})

	// Go to special offers page
	await page.goto(siteURL)

	// Get div containing vehicle deals
	const grid = await page.$("div.special-offers-cols.special-offers-grid")

	// Iterate through all items, parsing offer details
	const items = await grid?.$$eval("div#single-special", elements => {
		return elements.map(el => {
			const c = el.querySelector(".special-offer-content")
			return {
				title: c?.querySelector(".car-title")?.innerHTML || "",
				link: el.querySelector("a")?.href || "",
				lease: c?.querySelector(".tr_lease-length + *")?.innerHTML || "",
				avail: c?.querySelector(".tr_availability + *")?.innerHTML || "",

				// NOTE: The developers behind this website made a spelling mistake,
				// so at the time of writing, this is the work around... lol
				fuel: c?.querySelector('[classs="tr_fuel-type notranslate"] + *')?.innerHTML || ""
			}
		})
	}) || []

	// Close the browser
	if (!(env.MODE === "TEST")) await browser.close()

	// Return parsed offers
	return items
}

console.log(await parse())