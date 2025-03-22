// #region Imports

import * as dotenv from "dotenv"
import { z, ZodSchema } from "zod"
import { fileURLToPath, URL } from "node:url"
import * as process from "node:process"

// #endregion Imports



/** loadEnv
 * 
 * Load an env file in a specified directory or file path.
 * 
 * Use a zod schema to validate `process.env`.
 * 
 * Return the env vars.
 */
export const loadEnv = <
	Schema extends ZodSchema,
	Data extends z.infer<Schema>
> (
	envURL: URL,
	schema: Schema
): Data => {
	// Load environment variables
	dotenv.config({ path: fileURLToPath(envURL) })

	// Parse variables with schema
	const result = schema.safeParse(process.env)
	if (!result.success) {
		console.error("Incorrect env options:", result.error)
		process.exit(1)
	}

	// Return parsed values
	return result.data
}



export default loadEnv