import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const getLanguage = async () => {
	const {
		name,
		password
	} = JSON.parse(event.queryStringParameters);

	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			headers: {
				"Authorization": `Basic ${process.env.FAUNA_KEY}`
			},
			method: "POST",
			body: JSON.stringify({
				query: `
					query {
						languagesByCreds (
							name: "${name}",
							password: "${crypto.createHash("sha256").update(password).digest("hex")}"
						) {
							data {
								id
								name
								creatorName
								creatorEmail
								notes
								sentenceStructure
								syllableStructures
							}
						}
					}
				`
			})
		}
	);

	return await response.json();
};

const createLanguage = async () => {
	const id = uuidv4();
	const {
		name,
		password,
		creatorName,
		creatorEmail,
		notes,
		sentenceStructure,
		syllableStructures
	} = JSON.parse(event.body);

	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			headers: {
				"Authorization": `Basic ${process.env.FAUNA_KEY}`
			},
			method: "POST",
			body: JSON.stringify({
				query: `
					mutation CreateLanguage {
						createLanguage(
							data: {
								id: "${id}",
								name: "${name}",
								password: "${crypto.createHash("sha256").update(password).digest("hex")}",
								creatorName: "${creatorName}",
								creatorEmail: "${creatorEmail}",
								notes: ${JSON.stringify(notes)}
								sentenceStructure: "${sentenceStructure}"
								syllableStructures: ${JSON.stringify(syllableStructures)}
							}
						) {
							id
						}
					}
				`
			})
		}
	);
	return await response.json();
};

exports.handler = async function (event, context) {
	let results;
	switch (event.httpMethod) {
		case "POST":
			results = await createLanguage();
			break;

		case "GET":
			results = await getLanguage();
			break;

		return {
			statusCode: 200,
			body: JSON.stringify(results)
		};
	}
}
