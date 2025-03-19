// #region Imports

import env from "./env"
import { scrape, offersDataUrl } from "./src/scraper"
import * as data from "./src/persistent-data"
import { z } from "zod"
import { CronJob } from "cron"
import { Offer, OfferSet, OfferMap } from "./src/types"

// #endregion Imports



// #region Main

const main = async () => {

	// Get all offers stored in the json file
	const validateOffers = await data.get(offersDataUrl, OfferSet)

	// Create a reference to the stored offers
	let storedOffers: OfferSet = validateOffers.success
		? validateOffers.result
		: new Set()
	
	console.info(`Already seen offers: ${storedOffers.size}`)



	// #region Cron Job

	// Set how frequently cron job should run
	const cronTime = env.MODE === "PROD"
	// s    m    h    D    M    Wd
	? "0    0    0    *    *    *   " // Every day
	: "*/5  *    *    *    *    *   " // Every 5s


	// Create subroutine to run be run as a cron job
	async function onTick() {
		// Scrape offers
		const newOffers = await scrape()

		// Get differences between last tick
		const diffs = compareOffersSets(storedOffers, newOffers)
		console.info(
			`Offers deleted: ${diffs.deleted.size}\tOffers added: ${diffs.added.size}`
		)

		// Update stored offers
		await data.save(offersDataUrl, newOffers)
		storedOffers = newOffers
	}

	// Create a cron job to be run periodically
	const job = CronJob.from({ cronTime, onTick })


	// Do initial tick if option set
	if (env.TICK_ON_START) {
		console.info("Initial tick")
		await onTick()
	}

	// Start cron job
	console.info("Starting cron job")
	job.start()

	// #endregion Cron Job
}

// #endregion Main



// #region Offers Utils

// Subroutine to generate a hash for an offer
const hashOffer = (offer: Offer): string => JSON.stringify(
	offer, Object.keys(offer).sort()
)


// Merge 2 sets without forcing reference equality, removing duplicates
const mergeOffersSets = (setA: OfferSet, setB: OfferSet): OfferSet => {
	/*
		The reason why combining sets the regular way will not work, is because
		objects with different references are not considered equal, so we would 
		end up with objects with different references, but duplicate values.
	*/

	// Initialise map to hold unique hashes and objects
	const uniqueOffers: OfferMap = new Map()

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
const compareOffersSets = (current: OfferSet, updated: OfferSet): {
	deleted: OfferSet,
	added: OfferSet
} => {
	
	// Initialise maps to hold diffs
	const deleted: OfferMap = new Map()
	const added: OfferMap = new Map()

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

// #endregion Offers Utils



await main()