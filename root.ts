// #region Imports

import { URL, pathToFileURL } from "node:url"

// #endregion Imports



const runningAsExe = !(Deno.execPath().endsWith("deno.EXE"))
const denoExecUrl = pathToFileURL(Deno.execPath())

export const rootUrl = runningAsExe
	? new URL("./", denoExecUrl)
	: new URL("./", import.meta.url)