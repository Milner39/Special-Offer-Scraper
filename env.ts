// #region Imports

import { URL } from "node:url"
import loadEnv from "./packages/load-env"
import { z } from "zod"

// #endregion Imports



// Create URL to env file
const envURL = new URL("./.env", import.meta.url)


// Create schema for env vars
const schema = z.object({
	MODE: z.enum(["PROD", "TEST"])
})


// Load env
const env = loadEnv(envURL, schema)


// Export env vars
export default env