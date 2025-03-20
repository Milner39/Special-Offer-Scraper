// #region Imports

import env from "../../env"
import { URL } from "node:url"
import puppeteer, { LaunchOptions, Page } from "puppeteer-core"
import { OfferSet, Auth } from "../types"
import * as data from "../persistent-data"

// #endregion Imports



// #region Consts

const launchOptions = {
	headless: env.HEADLESS,
	channel: "chrome"
} satisfies LaunchOptions



export const offersDataUrl = new URL(
	`./data/offers-${env.MODE}.json`, import.meta.url
)
const authDataUrl = new URL(
	`./data/auth.json`, import.meta.url
)



const pageUrl = new URL("https://www.nhsfleetsolutions.co.uk")
const baseUrl = env.MODE === "PROD"
	? pageUrl
	: new URL("../../test-page", import.meta.url)

const loginPage = "/login"
const offersPage = "/special-offers"

const formatPath = (path: string) => {
	const pathSuffix = env.MODE === "TEST"
		? "/index.html"
		: ""

	return path + pathSuffix
}



const usingLogin = (
	// In production
	env.MODE === "PROD" &&

	// Login credentials set
	typeof env.FLT_SOL_EMAIL === "string" &&
	typeof env.FLT_SOL_PASS === "string"
)

// #endregion Consts



// #region Main

export const scrape = async () => {

	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch(launchOptions)
	const [page] = await browser.pages()
	await page.setViewport({width: 1080, height: 1024})


	// If using login, ensure page is logged in
	if (usingLogin) {
		// Set set auth cookies to their last saved values
		await initAuthCookies(page)

		// Check if new auth cookies are needed, and log in
		if (!(await checkLoggedIn(page))) await logIn(page)
	}

	// Get offers
	const offers = await getOffers(page)

	// close browser
	await browser.close()

	// return offers
	return offers
}

// #endregion Main



// #region Subroutines

const initAuthCookies = async (page: Page): Promise<void> => {

	// Get last saved auth info
	const getAuth = await data.get(authDataUrl, Auth)
	if (!getAuth.success) return

	// Set cookie on page
	await page.browser().setCookie({
		name: "PHPSESSID",
		value: getAuth.result.PHPSESSID,
		domain: baseUrl.hostname,
		httpOnly: true,
		secure: true
	})
}


const checkLoggedIn = async (page: Page): Promise<boolean> => {

	// Go to home page
	await page.goto(formatPath(baseUrl.href))

	// Get the header element
	const header = await page.$("header")
	if (!header) throw new Error("Unable to find header")

	// Get classes on header
	const classes = new Set(await header.evaluate(
		el => Array.from(el.classList))
	)

	/* 
		The header element has a specific class if logged in
		logged in ? "logged-in" : "not-logged-in"
	*/
	// Return logged in status
	return classes.has("logged-in")
}


const logIn = async (page: Page): Promise<string> => {

	// Go to login page
	await page.goto(formatPath(baseUrl.href+loginPage))

	// Fill out login form
	const form = await page.$("form")
	if (!form) throw new Error("Unable to find form")
	await form.frame.locator("#login_email").fill(env.FLT_SOL_EMAIL || "")
	await form.frame.locator("#login_password").fill(env.FLT_SOL_PASS || "")

	// Submit form
	// wait for the first response where the request method was "POST"
	const [response] = await Promise.all([
		page.waitForResponse(response => response.request().method() === "POST"),
		form.evaluate(form => form.submit())
	])

	// Get cookies response header
	const cookies = response.headers()["set-cookie"] || ""

	// Get session id from cookies
	const match = cookies.match(/PHPSESSID=([^;]+)/)
	const sessionId = match ? match[1] : null
	if (!sessionId) throw new Error("Login details incorrect")

	// Save auth info locally
	await data.save(authDataUrl, {
		PHPSESSID: sessionId
	} satisfies Auth)

	// Return session id
	return sessionId
}


const getOffers = async (page: Page): Promise<OfferSet> => {
	
	// Go to offers page
	await page.goto(formatPath(baseUrl.href+offersPage))

	// Get div containing offers
	const offersGrid = await page.$(".special-offers-cols, .special-offers-grid")
	if (!offersGrid) throw new Error("Unable to find offers gird")
	
	// Get all offers
	const offers: OfferSet = new Set(
		await offersGrid.$$eval(":scope > div", (els, [pageUrl]) => {
			
			// Trim whitespace subroutine
			const trimWS = (str: string) => str
				.trim()
				.replace(/\s+/g, " ")
			
			// Parse the details of every offer
			return els.map(el => {
				const content = el.querySelector(".special-offer-content")
				return {
					title: trimWS(content
						?.querySelector(".car-title")
						?.innerHTML 
						|| ""
					),
					link: pageUrl + (el
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
				}
			})
		}, [pageUrl] as const)
	)

	// Save offer info locally
	await data.save(offersDataUrl, offers)

	// Return all offers
	return offers
}

// #endregion Subroutines