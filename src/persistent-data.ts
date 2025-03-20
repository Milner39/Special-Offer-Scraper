// #region Imports

import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"
import * as json from "../packages/json"
import { z, ZodSchema } from "zod"
import { Result } from "./types"

// #endregion Imports



// #region Write

export const save = 
async (fileUrl: URL, data: unknown):
Promise<void> => {
	
	// Write data to json file
	await savePlain(fileUrl, json.stringify(data, 4))
}


export const savePlain =
async (fileUrl: URL, data: string):
Promise<void> => {

	// Get directory path
	const dir = path.dirname(fileURLToPath(fileUrl))

	// Ensure directory exists
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	// Write data to file
	await fs.promises.writeFile(fileUrl, data)
}

// #endregion Write



// #region Read

export const get = 
async <Schema extends ZodSchema>
(fileUrl: URL, schema: Schema): 
Promise<Result<z.infer<Schema>>> => {

	// Get plain data
	const getPlainData = await getPlain(fileUrl)
	if (!getPlainData.success) return getPlainData

	// Parse plain data for json
	const data = json.parse(getPlainData.result)

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


export const getPlain = 
async (fileUrl: URL):
Promise<Result<string>> => {

	// If file does not exist
	if (!fs.existsSync(fileUrl)) return {
		result: null,
		success: false,
		error: "File does not exist"
	}

	// Read data from file
	const data = await fs.promises.readFile(fileUrl, "utf-8")

	// Return data
	return {
		result: data,
		success: true
	}
}

// #endregion Read