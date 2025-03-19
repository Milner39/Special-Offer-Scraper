// #region Imports

import env from "../../env"
import * as nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

// #endregion Imports



// #region Subroutines

export const createTransport = 
async ():
Promise<{
	result: nodemailer.Transporter,
	success: true
} | {
	result: null,
	success: false,
	error: unknown
}> => {
	// Options for transport
	const options: SMTPTransport.Options = {
		service: "gmail",
		host: "smtp.gmail.com",
		auth: {
			// Will both be defined
			user: env.ALERTER_EMAIL_USER || "",
			pass: env.ALERTER_EMAIL_PASS || ""
		}
	}

	// Create transport
	const transport = nodemailer.createTransport(options)

	// Verify transport
	const verification = await verifyTransport(transport)
	if (!verification.result) return {
		result: null,
		success: false,
		error: verification.error
	}

	// Return transport
	return {
		result: transport,
		success: true
	}
}


// ISSUE: This is ridiculously slow for some reason
export const verifyTransport = 
async (transport: nodemailer.Transporter):
Promise<{
	result: true,
	error: null
} | {
	result: false,
	error: unknown
}> => new Promise((resolve) => {
	transport.verify((error) => {
		if (error) resolve({
			result: false,
			error: error
		})

		resolve({
			result: true,
			error: null
		})
	})
})

// #endregion Subroutines