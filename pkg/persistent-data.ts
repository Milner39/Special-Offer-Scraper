// #region Imports

import { z, ZodSchema } from "zod"
import { Result } from "src/types"
import * as json from "pkg/json"
import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"

// #endregion Imports



// #region Write

export const save = 
async (fileUrl: URL, data: unknown):
Promise<Result<true>> => {
	
	// Write data to json file
	const writePlainData = await savePlain(fileUrl, json.stringify(data, 4))
	if (!writePlainData.success) return writePlainData

	// Return success
	return {
		result: true,
		success: true
	}
}


export const savePlain =
async (fileUrl: URL, data: string):
Promise<Result<true>> => {

	// Get directory path
	const dir = path.dirname(fileURLToPath(fileUrl))

	try {
		// Ensure directory exists
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
	
		// Write data to file
		await fs.promises.writeFile(fileUrl, data)

		// Return success
		return {
			result: true,
			success: true
		}
	}

	catch (err) {
		return {
			result: null,
			success: false,
			error: err
		}
	}
}

// #endregion Write



// #region Read

export const get = 
async <Schema extends ZodSchema>
(fileUrl: URL, schema: Schema): 
Promise<Result<z.infer<Schema>>> => {

	// Read plain data
	const readPlainData = await getPlain(fileUrl)
	if (!readPlainData.success) return readPlainData

	// Parse plain data for json
	const data = json.parse(readPlainData.result)

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

	try {
		// Read data from file
		const data = await fs.promises.readFile(fileUrl, "utf-8")

		// Return data
		return {
			result: data,
			success: true
		}
	}

	catch (err) {
		return {
			result: null,
			success: false,
			error: err
		}
	}

}

// #endregion Read