// #region Imports

import { URL } from "node:url"
import { rootUrl } from "../../../../root"
import { compileHtml } from "../../../../packages/handlebars"
import { OfferSet } from "../../../types"

// #endregion Imports



const templateUrl = new URL(
	"./static/alerter/html/templates/new-offers/template.hbs", 
	rootUrl
)

export default async (offers: OfferSet) => {
	// Compile template file with configured options
	return await compileHtml({
		templateUrl,
		context: {
			single: offers.size === 1,
			offers: Array.from(offers)
		}
	})
}