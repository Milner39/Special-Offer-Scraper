// #region Imports

import { URL } from "node:url"
import handlebars from "handlebars"
import * as data from "../../../persistent-data"
import { OfferSet } from "../../../types"

// #endregion Imports



const templateUrl = new URL("./template.hbs", import.meta.url)

export const compileHtml = async (offers: OfferSet) => {
	// Get template file
	const getTemplateSource = await data.getPlain(templateUrl)
	if (!getTemplateSource.success) throw getTemplateSource.error

	// Compile html
	const html = handlebars.compile(getTemplateSource.result)({
		single: offers.size === 1,
		offers: Array.from(offers)
	})

	// Return html
	return html
}