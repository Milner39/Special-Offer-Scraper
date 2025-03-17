// #region Imports

import { z } from "zod"

// #endregion Imports



// #region Schemas

const Set_Json = z.strictObject({
	DATA_TYPE: z.literal("Set"),
	_: z.array(z.unknown())
})
type Set_Json = z.infer<typeof Set_Json>


const Map_Json = z.strictObject({
	DATA_TYPE: z.literal("Map"),
	_: z.array(z.tuple([
		z.unknown(),
		z.unknown()
	]))
})
type Map_Json = z.infer<typeof Map_Json>



const jsonTypes = Object.freeze({
	"Set": { schema: Set_Json, constructor: Set },
	"Map": { schema: Map_Json, constructor: Map }
})
type JsonType = keyof typeof jsonTypes

type JsonTypeSchemas <T extends JsonType = JsonType> = z.infer<
	(typeof jsonTypes)[T]["schema"]
>
type JsonTypeConstructors <T extends JsonType = JsonType> = 
	(typeof jsonTypes)[T]["constructor"]

type JsonTypeClasses <T extends JsonType = JsonType> = InstanceType<
	JsonTypeConstructors<T>
>

// #endregion Schemas



// #region Replacer

const replacer = 
<Val extends unknown>
(_: unknown, value: Val):
(
	// NOTE: `<infer Type>` does not work here
	Val extends JsonTypeClasses
		? JsonTypeSchemas
		: Val
) => {
	
	// Check if value is an allowed class
	if (value instanceof Set) {
		// @ts-ignore
		return { 
			DATA_TYPE: "Set",
			_: [...value] as unknown[]
		} as const
	}
	if (value instanceof Map) {
		// @ts-ignore
		return {
			DATA_TYPE: "Map",
			_: [...value.entries()] as [unknown, unknown][]
		} as const
	}

	// Return the value as-is
	// @ts-ignore
	return value

	// TODO: Fix TS errors
}

// #endregion Replacer



// #region Reviver

const reviver =
<Val extends unknown>
(_: string, value: Val):
(
	// NOTE: `<infer Type>` does not work here
	Val extends JsonTypeSchemas
		? JsonTypeClasses 
		: Val
) => {

	// If value has `DATA_TYPE` attribute
	if (
		value &&
		typeof value === "object" &&
		"DATA_TYPE" in value
	) {
		// Check if value matches json type it claims to be
		if (matchesJsonType(value, value.DATA_TYPE)) {
			// `value` type is correctly inferred, TS unhappy with constructors
			// @ts-ignore
			return new jsonTypes[value.DATA_TYPE].constructor(value._)
		}
	}

	// Return the value as-is
	// @ts-ignore
	return value

	// TODO: Fix TS errors
}


//Checks if provided value is an allowed json type
const isJsonType =
<T extends JsonType>
(val: unknown): 
val is T => {
	return (typeof val === "string" && val in jsonTypes)
}


// Checks if provided value matches a provided json type
const matchesJsonType =
<T extends JsonType>
(value: unknown, type: unknown):
value is (z.infer<(typeof jsonTypes)[T]["schema"]>) => {

	// Check type is an option
	if (!isJsonType(type)) return false

	// Validate value
	return jsonTypes[type].schema.safeParse(value).success
}

// #endregion Reviver



// #region Exports

export const stringify = (value: any, space?: number) =>
	JSON.stringify(value, replacer, space)

export const parse = (text: string) =>
	JSON.parse(text, reviver)

// #endregion Exports