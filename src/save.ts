// #region Imports

import env from "../env"
import { fileURLToPath, URL } from "node:url"
import * as fs from "node:fs"
import type { SpecialOffer } from "../.d.ts"

// #endregion Imports



const fileURL = new URL(`../data/${env.MODE}.json`, import.meta.url)



// Write data to local file
export const save = (offers: SpecialOffer[]) => {
	fs.writeFile(fileURL, JSON.stringify(offers, null, 4), (err) => {
		if (err) throw err
	})
}