// #region Imports

import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"
import * as JSON from "../packages/json"
import { z, ZodSchema } from "zod"

// #endregion Imports



// #region Write

export const save = 
async (fileUrl: URL, data: unknown):
Promise<void> => {
	// Get directory path
	const dir = path.dirname(fileURLToPath(fileUrl))

	// Ensure directory exists
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	// Write data to JSON file
	await fs.promises.writeFile(fileUrl, JSON.stringify(data, 4))
}

// #endregion Write



// #region Read

export const get = 
async <Schema extends ZodSchema>
(fileUrl: URL, schema: Schema): 
Promise<{
	result: z.infer<Schema>,
	success: true
} | {
	result: null,
	success: false,
	error?: unknown
}> => {
	// If file does not exist
	if (!fs.existsSync(fileUrl)) return {
		result: null,
		success: false,
		error: "File does not exist"
	}

	// Read data from JSON file
	const data = JSON.parse(await fs.promises.readFile(fileUrl, "utf-8"))

	// Validated data
	const parsed = schema.safeParse(data)
	if (!parsed.success) return {
		result: null,
		success: false,
		error: parsed.error
	}

	// Return data
	return {
		result: parsed.data,
		success: true
	}
}

// #endregion Read