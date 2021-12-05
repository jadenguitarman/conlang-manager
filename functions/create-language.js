import crypto from "crypto"
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

exports.handler = async function (event, context) {
	const id = uuidv4();
	const name = "Toki Pona";
	const password = crypto.createHash("sha256").update("password").digest("hex");
	const creatorName = "Sonja Lang";
	const creatorEmail = "sonja@example.com";
	const notes = JSON.stringify([
		"Note 1",
		"Note 2"
	]);
	const sentenceStructure = "SVO";
	const syllableStructures = JSON.stringify([
		"CVC",
		"VC",
		"CV"
	]);

	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			headers: {
				"Authorization": "Basic Zm5BRVpwSFBmT0FBUU1SVEFISXVicTdqSlpxQnBoWEJ2bktBbW5JYjpsYW5ndWFnZXM6YWRtaW4="
			},
			method: "POST",
			body: JSON.stringify({
				query: `
					mutation CreateLanguage {
						createLanguage(
							data: {
								id: "${id}",
								name: "${name}",
								password: "${password}",
								creatorName: "${creatorName}",
								creatorEmail: "${creatorEmail}",
								notes: ${notes}
								sentenceStructure: "${sentenceStructure}"
								syllableStructures: ${syllableStructures}
							}
						) {
							id
						}
					}
				`
			})
		}
	);
	const results = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(results)
    };
}
