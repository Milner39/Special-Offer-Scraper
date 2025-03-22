// #region Imports

import handlebars from "handlebars"
import { URL } from "node:url"
import { rootUrl } from "@/root"
import { OfferSet } from "src/types"
import { compileHtml } from "pkg/handlebars"

// #endregion Imports



const templateUrl = new URL(
	"./static/alerter/html/templates/new-offers/template.hbs",
	rootUrl
)



const raw = (str: string) => {
	return new handlebars.SafeString(str)
}

export default async (offers: OfferSet) => {
	// Compile template file with configured options
	return await compileHtml({
		templateUrl,
		context: {
			single: offers.size === 1,
			offers: Array.from(offers),

			tableStyle: 'style="width: 100%; border-spacing: 0;"'
		},
		helpers: new Map([
			["raw", raw]
		])
	})
}