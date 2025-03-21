// #region Imports

import { URL } from "node:url"

// #endregion Imports



const execPathToUrl = (path: string) => {
    const formatted = "file:///" + path
        .replaceAll("\\", "/")

    const url = new URL("./", formatted)

    return url
}

export const rootUrl = Deno.execPath().endsWith("scraper.exe")
    ? execPathToUrl(Deno.execPath())
    : new URL("./", import.meta.url)