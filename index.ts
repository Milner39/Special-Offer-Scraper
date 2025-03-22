// #region Imports

import env from "./env"
import { scrape, offersDataUrl, usingLogin } from "./src/scraper"
import { alertToOffers, usingMailAlerts } from "./src/alerter"
import * as data from "./packages/persistent-data"
import { CronJob } from "cron"
import { Offer, OfferSet, OfferMap } from "./src/types"

// #endregion Imports



// #region Main

const main = async () => {

	console.info(`Running in ${env.MODE} mode`)
	if (usingLogin) console.info("Using Fleet Solutions login")
	if (usingMailAlerts) console.info("Using mail alerts")


	// Get all offers stored locally
	const getLocalOffers = await data.get(offersDataUrl, OfferSet)

	// Create a reference to the stored offers
	let storedOffers: OfferSet = getLocalOffers.success
		? getLocalOffers.result
		: new Set()
	
	// Appropriate log message
	if (getLocalOffers.success) {
		console.info(`Offers stored locally: ${storedOffers.size}`)
	} else {
		console.error(`Could not find any offers stored locally: ${getLocalOffers.error}`)
	}



	// #region Cron Job

	// Set how frequently cron job should run
	const cronTime = env.MODE === "PROD"
	// s    m    h    D    M    Wd
	? "0    0    */1  *    *    *   " // Every hour
	: "*/10 *    *    *    *    *   " // Every 10s


	/** Subroutine to run be run as a cron job */
	async function onTick() {

		console.info("Scraping offers...")

		// Scrape offers from website
		const getNewOffers = await scrape()
		if (!getNewOffers.success) {
			console.error(`Could not scrape offers: ${getNewOffers.error}`)
			return
		}

		// Get differences between now and last tick
		const diffs = compareOffersSets(storedOffers, getNewOffers.result)
		console.info(`Offers deleted: ${diffs.deleted.size}, added: ${diffs.added.size}`)
		

		// Send alerts of offer changes
		if (
			(diffs.deleted.size > 0 || diffs.added.size > 0) &&
			usingMailAlerts
		) {
			console.info("Sending alerts...")
			
			const alert = await alertToOffers(diffs.deleted, diffs.added)
			if (!alert.success) {
				console.error(`Could not alert to offers: ${alert.error}`)
			} else {
				console.info("Alerts sent")
			}
		}


		// Save offers locally
		const saveLocalOffers = await data.save(offersDataUrl, getNewOffers.result)
		if (!saveLocalOffers.success) {
			console.error(`Could not save offers locally: ${saveLocalOffers.error}`)
		}

		// Update reference to stored offers
		storedOffers = getNewOffers.result
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

/** Subroutine to generate a hash for an offer */
const hashOffer = (offer: Offer): string => JSON.stringify(
	offer, Object.keys(offer).sort()
)


/** Merge 2 sets without forcing reference equality, removing duplicates */
const mergeOffersSets = (setA: OfferSet, setB: OfferSet): OfferSet => {
	/*
		The reason why combining sets the regular way will not work, is because
		objects with different references are not considered equal, so we would 
		end up with objects with different references, but duplicate values.
	*/

	// Initialise map to hold unique hashes and objects
	const uniqueOffers: OfferMap = new Map()

	/* Iterate over sets without creating another set or array of values
		This is more efficient then using the spread operator to create a single
		array of offers and iterating through that since a new large array does
		not need to be instantiated.

		This is not O(n^2) even though the nested for loops may make it 
		look like it.
	*/
	for (const set of [setA, setB]) {
		for (const offer of set) {
			// Duplicate offers will be overwritten
			const offerHash = hashOffer(offer)
			uniqueOffers.set(offerHash, offer)
		}
	}

	// Return values in the final set
	return new Set(uniqueOffers.values())

	// O(n+m) Time
}


/** Return the deletions and additions between 2 sets */
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