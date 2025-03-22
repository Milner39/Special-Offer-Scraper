// #region Imports

import { URL } from "node:url"
import { rootUrl } from "@/root"
import { OfferSet } from "src/types"
import { compileHtml } from "pkg/handlebars"

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