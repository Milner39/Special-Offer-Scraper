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
			offers: Array.from(offers),

			allStyle: "box-sizing: border-box;",
			"bg-clr-1": "#1c1c1c",
			"bg-clr-2": "#292929",
			"bg-clr-3": "#3b3b3b",
			"pm-clr-1": "#0090a6",
			"tx-clr-1": "rgba(255,255,255,95%)",
			"tx-clr-2": "rgba(255,255,255,82.5%)",
			"tx-clr-3": "rgba(255,255,255,70%)"
		}
	})
}