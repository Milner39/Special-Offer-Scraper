// #region Imports

import { rootUrl } from "@/root"
import { OfferSet } from "src/types"
import { compileHtml } from "pkg/handlebars"
import { URL } from "node:url"

// #endregion Imports



// #region Test Data

const offers: OfferSet = new Set([
	{
		"title": "AUDI Q6 E-TRON ESTATE 285kW Qtro 100kWh S Line 5dr Auto [Sound+Vision]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6068",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "AUDI Q6 E-TRON ESTATE 185kW 83kWh Sport 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6078",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "AUDI Q4 E-TRON ESTATE 210kW 45 82kWh S Line 5dr Auto [Leather]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6091",
		"leaseLength": "36 Months",
		"availability": "April - June",
		"fuelType": "Electric"
	},
	{
		"title": "AUDI Q4 E-TRON SPORTBACK 210kW 45 82kWh S Line 5dr Auto [Leather]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6099",
		"leaseLength": "36 Months",
		"availability": "April - June",
		"fuelType": "Electric"
	},
	{
		"title": "FORD KUGA 2.5 PHEV ST-Line X 5dr CVT",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6121",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Hybrid / Electric"
	},
	{
		"title": "BMW iX3 ELECTRIC ESTATE 210kW M Sport 80kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6131",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW I4 210kW eDrive35 M Sport 70kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5493",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW iX 240kW xDrive40 M Sport 76.6kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5507",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW I4 400kW M50 83.9kWh 5dr Auto [18 Alloy]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5894",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW I5 TOURING 250kW eDrive40 M Sport 84kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5501",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW iX2 150kW eDrive20 M Sport 65kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5792",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BMW I7 SALOON 335kW eDrive50 Excellence 105.7kWh 4dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5743",
		"leaseLength": "36 Months",
		"availability": "May - June",
		"fuelType": "Electric"
	},
	{
		"title": "LAND ROVER DISCOVERY SPORT 1.5 P270e Dynamic SE 5dr Auto [5 Seat]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6166",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Hybrid / Electric"
	},
	{
		"title": "BMW iX1 150kW eDrive20 M Sport 65kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5489",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "LAND ROVER RANGE ROVER EVOQUE 1.5 P270e S 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6045",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Hybrid / Electric"
	},
	{
		"title": "BYD SEAL 390kW Excellence AWD 83kWh 4dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5606",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "BYD DOLPHIN 150kW Comfort 60.4kWh Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5910",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "CUPRA TAVASCAN 210kW V1 77kWh 5dr Auto [Winter Pack]",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5672",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "HYUNDAI IONIQ 5 ELECTRIC HATCHBACK 168kW N Line 84 kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5735",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "KIA NIRO 150kW 2 Nav 65kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6161",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "MERCEDES-BENZ EQA EQA 250+ 140kW AMG Line Executive 70.5kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5972",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "MERCEDES-BENZ GLA HATCHBACK 250e AMG Line Executive 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5878",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Hybrid / Electric"
	},
	{
		"title": "MERCEDES-BENZ EQE ESTATE 350+ 215kW AMG Line Edition 96kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6018",
		"leaseLength": "36 Months",
		"availability": "May - June",
		"fuelType": "Electric"
	},
	{
		"title": "MG MOTOR UK MG4 150kW SE [Nav] EV Long Range 64kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5963",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "MINI COUNTRYMAN 230kW SE Exclusive ALL4 66kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5518",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "MAZDA MX-30 107kW Prime Line 35.5kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5947",
		"leaseLength": "36 Months",
		"availability": "March",
		"fuelType": "Electric"
	},
	{
		"title": "MERCEDES-BENZ GLC ESTATE 300e 4Matic Urban Edition 5dr 9G-Tronic",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6147",
		"leaseLength": "36 Months",
		"availability": "June",
		"fuelType": "Hybrid / Electric"
	},
	{
		"title": "RENAULT CLIO 1.0 TCe 90 Evolution 5dr",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5876",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Petrol"
	},
	{
		"title": "SKODA ENYAQ ESTATE 210kW 85 Edition 82kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5600",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "SKODA ELROQ ESTATE 150kW 60 Edition 63kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5835",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VAUXHALL GRANDLAND ELECTRIC HATCHBACK 157kW GS 73kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=6109",
		"leaseLength": "24 Months",
		"availability": "June",
		"fuelType": "Electric"
	},
	{
		"title": "VOLKSWAGEN ID.4 210kW Match Pro 77kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5797",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VOLKSWAGEN ID.7 210kW Match Pro 77kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5799",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VOLKSWAGEN ID.7 TOURER 210kW Match Pro 77kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5813",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	},
	{
		"title": "VOLKSWAGEN ID.5 210kW Match Pro 77kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5814",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VOLVO EX30 200kW SM Extended Range Plus 69kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5738",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VOLVO EX30 315kW Twin Motor Performance Plus 69kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5741",
		"leaseLength": "36 Months",
		"availability": "March",
		"fuelType": "Electric"
	},
	{
		"title": "VOLVO EX40 300kW Twin Motor Plus 82kWh 5dr AWD Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=5759",
		"leaseLength": "36 Months",
		"availability": "April",
		"fuelType": "Electric"
	},
	{
		"title": "VOLKSWAGEN ID. BUZZ 210kW Life Pro 79kWh 5dr Auto",
		"link": "https://www.nhsfleetsolutions.co.uk//vehicle-select/?sid=4997",
		"leaseLength": "36 Months",
		"availability": "April - May",
		"fuelType": "Electric"
	}
])

// #endregion Test Data



// #region Main

const templateUrl = new URL(
	"./static/test-site/templates/special-offers/template.hbs", 
	rootUrl
)
const outUrl = new URL(
	"./out/test-site/special-offers/index.html",
	rootUrl
)



const fuelTypeToClassSuffix = {
	"Electric": "Electric",
	"Hybrid / Electric": "Hybrid",
	"Hybrid": "Hybrid",
	"Petrol": "Combustion",
	"Diesel": "Combustion"
} as const
type FuelType = keyof typeof fuelTypeToClassSuffix

const fuelTypeToClassName = (fuelType: FuelType) => {
	return `fuel-type-${fuelTypeToClassSuffix[fuelType]}`
}

export default async () => {
	// Compile template file with configured options
	return await compileHtml({
		templateUrl,
		outUrl,
		context: {
			offers: Array.from(offers)
		},
		helpers: new Map([
			["fuelTypeToClassName", fuelTypeToClassName]
		])
	})
}

// #endregion Main