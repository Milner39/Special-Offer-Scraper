// #region Imports

import { URL } from "node:url"
import handlebars from "handlebars"
import * as data from "../packages/persistent-data"
import { Result } from "../src/types"

// #endregion Imports



type CompileHtmlOptions = {
	templateUrl: URL,
	context: Record<string, unknown>,
	helpers?: Map<string, handlebars.HelperDelegate>,
	outUrl?: URL
}



// #region Main

/** Compile a handlebars file into html */
export const compileHtml =
async (options: CompileHtmlOptions):
Promise<Result<string>> => {

	// Get template file
	const getTemplateSource = await data.getPlain(options.templateUrl)
	if (!getTemplateSource.success) return getTemplateSource

	try {
		// Register helpers
		if (typeof options.helpers !== "undefined") {
			for (const [name, func] of options.helpers.entries()) {
				handlebars.registerHelper(name, func)
			}
		}

		// Compile html
		const html = handlebars.compile(getTemplateSource.result)(
			options.context
		)

		// Save to out file
		if (typeof options.outUrl !== "undefined") {
			const saveHtmlSource = await data.savePlain(options.outUrl, html)
			if (!saveHtmlSource.result) return saveHtmlSource
		}

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



// #endregion Main