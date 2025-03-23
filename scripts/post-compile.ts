// #region Imports

import { rootUrl } from "@/root"
import * as data from "pkg/persistent-data"
import { URL } from "node:url"

// #endregion Imports



const buildDestUrl = new URL("./build/", rootUrl)
const envSrcUrl = new URL("./.env", rootUrl)
const staticSrcUrl = new URL("./static/", rootUrl)



const copyStaticToBuild = async () => {
	
	// Copy needed files / dirs to build output
	const copyEnv = await data.copy(envSrcUrl, buildDestUrl)
	if (copyEnv.success) {
		console.info("\`.env\` copied to build output")
	}

	const copyStatic = await data.copy(staticSrcUrl, buildDestUrl)
	if (copyStatic.success) {
		console.info("\`static/\` copied to build output")
	}
}



await copyStaticToBuild()