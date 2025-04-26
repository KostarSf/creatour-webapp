export async function sendMessage(text: string) {
	await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			chat_id: process.env.TG_CHAT_ID,
			text: text,
		}),
	});
}
