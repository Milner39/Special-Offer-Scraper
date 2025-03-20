// #region Imports

import { z } from "zod"

// #endregion Imports



// #region Zod Utils

export const boolFromString = z.union([
	z.literal("true").transform(() => true),
	z.literal("false").transform(() => false)
])

// #endregion Zod Utils