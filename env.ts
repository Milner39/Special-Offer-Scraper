// #region Imports

import { URL } from "node:url"
import { rootUrl } from "./root"
import loadEnv from "./packages/load-env"
import { z } from "zod"
import * as zz from "./packages/zod"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", rootUrl)


// Create schema for env vars
const schema = z.object({
	/* What mode to run the application
		PROD: Scraper hits the real site but ticks less frequently.

		TEST: Scraper hits a test site, and ticks more frequently, but does
		not use: 
			Fleet Solution login details for company filtering.
			Email alerts.
	*/
	MODE: z.enum(["PROD", "TEST"]).default("TEST"),

	// Tick instantly before starting tick cycle.
	TICK_ON_START: zz.boolFromString.default("false"),

	// Show browser when scraping
	HEADLESS: zz.boolFromString.default("true"),


	// Fleet Solutions login details, site will filter offers to your company
	FLT_SOL_EMAIL: z.string().email().optional(),
	FLT_SOL_PASS: z.string().optional(),


	/* Alerter email login details
		emails with new offers will be sent to set recipients.
		TODO: replace ALERTER_RECIPIENT with local json file
	*/
	ALERTER_EMAIL_USER: z.string().email().optional(),
	ALERTER_EMAIL_PASS: z.string().optional(),
	ALERTER_RECIPIENT: z.string().email().optional()
})


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
export default env