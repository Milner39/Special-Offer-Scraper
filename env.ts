// #region Imports

import { URL } from "node:url"
import loadEnv from "./packages/load-env"
import { z } from "zod"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", import.meta.url)


// Create schema for env vars
const schema = z.object({
	/* What mode to run the application
		PROD: Scraper hits the real site but ticks less frequently.

		TEST: Scraper hits a test site, and ticks more frequently, but login
		details can't be used.
	*/
	MODE: z.enum(["PROD", "TEST"]).default("TEST"),

	// Tick instantly before starting tick cycle.
	TICK_ON_START: z.coerce.boolean().default(false),

	// Fleet Solutions login details, site will filter offers to your company
	FLT_SOL_EMAIL: z.string().email().optional(),
	FLT_SOL_PASS: z.string().optional(),
})


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
export default env