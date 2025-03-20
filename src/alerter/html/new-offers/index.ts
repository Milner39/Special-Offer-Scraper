// #region Imports

import { URL } from "node:url"
import { compileHtml } from "../../../../packages/handlebars"
import { OfferSet } from "../../../types"

// #endregion Imports



export default async (offers: OfferSet) => {
	// Compile template file with configured options
	return await compileHtml({
		templateUrl: new URL("./template.hbs", import.meta.url),
		context: {
			single: offers.size === 1,
			offers: Array.from(offers)
		}
	})
}