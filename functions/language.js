import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const getLanguage = async ev => {
	const {
		name,
		password
	} = JSON.parse(ev.queryStringParameters);

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

const createLanguage = async ev => {
	const id = uuidv4();
	const {
		name,
		password,
		creatorName,
		creatorEmail,
		notes,
		sentenceStructure,
		syllableStructures
	} = JSON.parse(ev.body);

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

exports.handler = async ev => {
	let results;
	switch (ev.httpMethod) {
		case "POST":
			results = await createLanguage(ev);
			break;

		case "GET":
			results = await getLanguage(ev);
			break;
	}

	return {
		statusCode: 200,
		body: JSON.stringify(results)
	};
};
