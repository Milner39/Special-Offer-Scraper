// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"
import * as JSON from "../packages/json"
import { SpecialOffer } from "./types"
import { z } from "zod"

// #endregion Imports



const fileURL = new URL(`../data/${env.MODE}.json`, import.meta.url)



// #region Write

export const save = async (offers: Set<SpecialOffer>) => {
	// Get directory path
	const dir = path.dirname(fileURLToPath(fileURL))

	// Ensure directory exists
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	// Write data to JSON file
	await fs.promises.writeFile(fileURL, JSON.stringify(offers, 4))
}

// #endregion Write



// #region Read

export const get = async (): Promise<Set<SpecialOffer>> => {
	// If file does not exist
	if (!fs.existsSync(fileURL)) return new Set()

	// Read data from JSON file
	const data = JSON.parse(await fs.promises.readFile(fileURL, "utf-8"))

	// Return validated data
	return z.set(SpecialOffer).parse(data)
}

// #endregion Read