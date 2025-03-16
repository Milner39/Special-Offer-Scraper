// #region Imports

import env from "./env"
import { parse } from "./src/parse"
import * as dataF from "./src/persistent-data"
import { CronJob } from "cron"
import { SpecialOffer } from "./src/types"

// #endregion Imports



// #region Offers

type OffersSet = Set<SpecialOffer>
type OffersMap = Map<string, SpecialOffer>


// Subroutine to generate a hash for an offer
const hashOffer = (offer: SpecialOffer): string => JSON.stringify(
	offer, Object.keys(offer).sort()
)


// Merge 2 sets without forcing reference equality, removing duplicates
const mergeOffersSets = (setA: OffersSet, setB: OffersSet): OffersSet => {
	/*
		The reason why combining sets the regular way will not work, is because
		objects with different references are not considered equal, so we would 
		end up with objects with different references, but duplicate values.
	*/

	// Initialise map to hold unique hashes and objects
	const uniqueOffers: OffersMap = new Map()

	// Iterate over combined sets
	for (const offer of [...setA, ...setB]) {
		// Duplicate offers will be removed
		const offerHash = hashOffer(offer)
		uniqueOffers.set(offerHash, offer)
	}

	// Return values in the final set
	return new Set(uniqueOffers.values())

	// O(n+m) Time
}


// Return the additions and deletions between 2 sets
const compareOffersSets = (current: OffersSet, updated: OffersSet): {
	deleted: OffersSet,
	added: OffersSet
} => {
	
	// Initialise maps to hold diffs
	const deleted: OffersMap = new Map()
	const added: OffersMap = new Map()

	/*
		Initialise set to hold current hashes.
		This will let us check if an updated element should go in `added` later.
	*/
	const currentHashes = new Set<string>()


	// Iterate over current elements
	for (const offer of current) {
		const offerHash = hashOffer(offer)
		currentHashes.add(offerHash)

		/*
			Assume that none of the current elements are in `updated` so we can 
			just remove them later.
		*/
		deleted.set(offerHash, offer)
	}


	// Iterate over updated elements
	for (const offer of updated) {
		const offerHash = hashOffer(offer)

		// Remove the elements that should not be in `deleted`
		deleted.delete(offerHash)

		// If a hash is not in `currentHashes` then this element must be new
		if (!currentHashes.has(offerHash)) added.set(offerHash, offer)
	}

	// Return sets containing diffs
	return {
		deleted: new Set(deleted.values()),
		added: new Set(added.values())
	}

	// O(n+m) Time
}

// #endregion OffersMap



// Create a set containing all of the offers stored in the JSON file
let storedOffers: OffersSet = new Set(await dataF.get())
console.info(`Already seen offers: ${storedOffers.size}`)



// #region CronJob

// Set how frequently cron job should run
const cronTime = env.MODE === "PROD"
	// s    m    h    D    M    Wd
	? "0    0    0    *    *    *   " // Every day
	: "*/5  *    *    *    *    *   " // Every 5s


// Create subroutine to run on CronJob tick
async function onTick() {
	// Parse updated offers
	const newOffers = await parse()
	const newOffersSet: OffersSet = new Set(newOffers)

	// Get differences between last tick
	const diffs = compareOffersSets(storedOffers, newOffersSet)
	console.info(
		`Offers removed: ${diffs.deleted.size}\tOffers added: ${diffs.added.size}`
	)

	// Update stored offers
	dataF.save(newOffers)
	storedOffers = newOffersSet
}


// Create CronJob
const job = CronJob.from({ cronTime, onTick })

// Start CronJob
console.info("Starting cron job")
job.start()

// #endregion CronJob