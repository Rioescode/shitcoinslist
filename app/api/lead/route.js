import { NextResponse } from "next/server";

export async function POST(req) {
	const body = await req.json();

	if (!body.email) {
		return NextResponse.json(
			{ error: "Email is required" },
			{ status: 400 }
		);
	}

	try {
		// Just log the email for now
		console.log('New lead email:', body.email);
		
		return NextResponse.json({
			success: true,
			message: 'Email received'
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json(
			{ error: 'Failed to process email' },
			{ status: 500 }
		);
	}
}
