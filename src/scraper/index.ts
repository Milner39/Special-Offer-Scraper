// #region Imports

import puppeteer, { LaunchOptions, Page } from "puppeteer-core"
import env from "@/env"
import { rootUrl } from "@/root"
import { OfferSet, Auth, Result } from "src/types"
import * as data from "pkg/persistent-data"
import makeTestSite from "./make-test-site"
import { URL } from "node:url"

// #endregion Imports



// #region Consts

const launchOptions = {
	headless: env.HEADLESS,
	channel: "chrome"
} satisfies LaunchOptions



export const offersDataUrl = new URL(
	`./out/scraper/offers-${env.MODE}.json`, rootUrl
)
const authDataUrl = new URL(
	`./out/scraper/auth.json`, rootUrl
)



const pageUrl = new URL("https://www.nhsfleetsolutions.co.uk")
const baseUrl = env.MODE === "PROD"
	? pageUrl
	: new URL("./out/test-site", rootUrl)

const loginPage = "/login"
const offersPage = "/special-offers"

const formatPath = (path: string) => {
	const pathSuffix = env.MODE === "TEST"
		? "/index.html"
		: ""

	return path + pathSuffix
}



export const usingLogin = (
	// In production
	env.MODE === "PROD" &&

	// Login credentials set
	typeof env.FLT_SOL_EMAIL === "string" &&
	typeof env.FLT_SOL_PASS === "string"
)

// #endregion Consts



// #region Main

export const scrape = async (): Promise<Result<OfferSet>> => {

	// Compile test site if not in production
	if (env.MODE !== "PROD") {
		const compileTestSite = await makeTestSite()
		if (!compileTestSite.success) return {
			result: null,
			success: false,
			error: `Could not compile test site: ${compileTestSite.error}`
		}
	}

	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch(launchOptions)
	const [page] = await browser.pages()
	await page.setViewport({width: 1080, height: 1024})


	// If using login, ensure page is logged in
	if (usingLogin) {

		// Set auth cookies to their last saved values
		const setCookies = await initAuthCookies(page)
		if (!setCookies.success) return {
			result: null,
			success: false,
			error: `Could not set auth cookies: ${setCookies.error}`
		}

		// Check if new auth cookies are needed, and log in
		const checkLoggedInToPage = await checkLoggedIn(page)
		if (!checkLoggedInToPage.success) return {
			result: null,
			success: false,
			error: `Could not check login status: ${checkLoggedInToPage.error}`
		}
		if (!checkLoggedInToPage.result) {
			const logInToPage = await logIn(page)
			if (!logInToPage.success) return {
				result: null,
				success: false,
				error: `Could not login: ${logInToPage.error}`
			}
		}
	}

	// Get offers
	const getOffersFromPage = await getOffers(page)
	if (!getOffersFromPage.success) return {
		result: null,
		success: false,
		error: `Could not get offers: ${getOffersFromPage.result}`
	}

	// close browser
	await browser.close()

	// return offers
	return {
		result: getOffersFromPage.result,
		success: true
	}
}

// #endregion Main



// #region Subroutines

const initAuthCookies = async (page: Page): Promise<Result<boolean>> => {

	// Get last saved auth info
	const getAuth = await data.get(authDataUrl, Auth)
	if (!getAuth.success) {
		console.error(`Could not get Fleet Solutions auth locally: ${getAuth.error}`)
		return {
			result: false,
			success: true
		}
	}

	// Set cookie on page
	await page.browser().setCookie({
		name: "PHPSESSID",
		value: getAuth.result.PHPSESSID,
		domain: baseUrl.hostname,
		httpOnly: true,
		secure: true
	})

	// Return success
	return {
		result: true,
		success: true
	}
}


const checkLoggedIn = async (page: Page): Promise<Result<boolean>> => {

	// Go to home page
	await page.goto(formatPath(baseUrl.href))

	// Get the header element
	const header = await page.$("header")
	if (!header) return {
		result: null,
		success: false,
		error: "Could not find header"
	}

	// Get classes on header
	const classes = new Set(await header.evaluate(
		el => Array.from(el.classList))
	)

	/* 
		The header element has a specific class if logged in
		logged in ? "logged-in" : "not-logged-in"
	*/
	// Return logged in status
	return {
		result: classes.has("logged-in"),
		success: true,
	}
}


const logIn = async (page: Page): Promise<Result<string>> => {

	// Go to login page
	await page.goto(formatPath(baseUrl.href+loginPage))

	// Fill out login form
	const form = await page.$("form")
	if (!form) return {
		result: null,
		success: false,
		error: "Could not find form"
	}
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
	if (!sessionId) return {
		result: null,
		success: false,
		error: "Login details incorrect"
	}

	// Save auth info locally
	const saveAuth = await data.save(authDataUrl, {
		PHPSESSID: sessionId
	} satisfies Auth)
	if (!saveAuth.success) {
		console.error(`Could not save Fleet Solutions auth locally: ${saveAuth.error}`)
	}

	// Return session id
	return {
		result: sessionId,
		success: true
	}
}


const getOffers = async (page: Page): Promise<Result<OfferSet>> => {
	
	// Go to offers page
	await page.goto(formatPath(baseUrl.href+offersPage))

	// Get div containing offers
	const offersGrid = await page.$(".special-offers-cols, .special-offers-grid")
	if (!offersGrid) return {
		result: null,
		success: false,
		error: "Could not find offers gird"
	}
	
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

	// Return all offers
	return {
		result: offers,
		success: true
	}
}

// #endregion Subroutines