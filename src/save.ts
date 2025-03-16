// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import * as path from "node:path"
import type { SpecialOffer } from "../.d.ts"

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