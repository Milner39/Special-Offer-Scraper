// #region Imports

import { URL } from "node:url"
import handlebars from "handlebars"
import * as data from "../../../persistent-data"
import { OfferSet, Result } from "../../../types"

// #endregion Imports



const templateUrl = new URL("./template.hbs", import.meta.url)

export const compileHtml = 
async (offers: OfferSet):
Promise<Result<string>> => {

	// Get template file
	const getTemplateSource = await data.getPlain(templateUrl)
	if (!getTemplateSource.success) return getTemplateSource

	
	try {
		// Compile html
		const html = handlebars.compile(getTemplateSource.result)({
			single: offers.size === 1,
			offers: Array.from(offers)
		})

		// Return html
		return {
			result: html,
			success: true
		}
	}

	catch (err) {
		return {
			result: null,
			success: false,
			error: err
		}
	}
}