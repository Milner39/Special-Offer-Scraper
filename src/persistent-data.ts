// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"
import { specialOffer_schema, SpecialOffer } from "./types"
import { z } from "zod"

// #endregion Imports



const fileURL = new URL(`../data/${env.MODE}.json`, import.meta.url)



// Write data to local file
export const save = (offers: SpecialOffer[]) => {
	// Get directory path
	const dir = path.dirname(fileURLToPath(fileURL))

	// Ensure directory exists
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	// Write data to file
	fs.writeFile(fileURL, JSON.stringify(offers, null, 4), (err) => {
		if (err) throw err
	})
}


// Read data from local file
export const get = async (): Promise<SpecialOffer[]> => {
	// If file does not exist
	if (!fs.existsSync(fileURL)) return []

	// Get contents of JSON file
	const data = (await import(fileURL.href, { with: { type: "json" } })).default

	// Return validated data
	return z.array(specialOffer_schema).parse(data)
}