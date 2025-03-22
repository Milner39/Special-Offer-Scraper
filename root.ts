// #region Imports

import { URL } from "node:url"

// #endregion Imports



// ISSUE: May only work on windows
const execPathToUrl = (path: string) => {
	const formatted = "file:///" + path
		.replaceAll("\\", "/")

	return new URL(formatted)
}



const runningAsExe = Deno.execPath().endsWith("scraper.exe")
const denoExecUrl = execPathToUrl(Deno.execPath())

export const rootUrl = runningAsExe
	? new URL("./", denoExecUrl)
	: new URL("./", import.meta.url)