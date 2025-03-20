// #region Imports

import env from "../../env"
import * as nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { Result } from "../types"

// #endregion Imports



// #region Subroutines

export const createTransport = async (): 
Promise<Result<nodemailer.Transporter>> => {

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
	if (!verification.result) return verification

	// Return transport
	return {
		result: transport,
		success: true
	}
}


// ISSUE: This is ridiculously slow for some reason
export const verifyTransport = 
async (transport: nodemailer.Transporter):
Promise<Result<true>> => new Promise((resolve) => {

	// Verify transport
	transport.verify((error) => {
		if (error) resolve({
			result: null,
			success: false,
			error: error
		})

		resolve({
			result: true,
			success: true
		})
	})
})

// #endregion Subroutines