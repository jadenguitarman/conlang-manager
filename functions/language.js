const { Client, query: q } = require('faunadb');
const fetch = require('cross-fetch');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const createLanguage = async ({ name, creatorName, creatorEmail }) => {
	// connect to fauna
	const parentClient = new Client({
		secret: process.env.FAUNA_ADMIN_KEY,
		domain: "db.us.fauna.com"
	});


	// step 1
	// create child database
	const dbName = uuidv4();
	await parentClient.query(
		q.CreateDatabase({ name: dbName })
	);

	// create key for child database
	const adminChildKey = (
		await parentClient.query(
			q.CreateKey({
				name: `admin`,
				database: q.Database(dbName),
				role: 'admin'
			})
		)
	).secret;


	// step 2
	// add GraphQL schema to child database
	await fetch(`https://graphql.us.fauna.com/graphql`, {
		method: "post",
		body: `
			type Phoneme {
				id: String!
				manner: String
				place: String
				roundedness: String
				height: String
				phonation: String
				notes: String
				ipa: String
				symbols: [Symbol] @relation
			}

			type Symbol {
				svg: String
				phonemes: [Phoneme] @relation
			}

			type PhonotacticRule {
				allowed: Boolean!
				construction: String!
			}

			type Conjugation {
				name: String!
				rootWord: Word!
				conjugatedWord: String
			}

			type Word {
				root: String!
				partOfSpeech: String!
				conjugations: [Conjugation]
			}

			type Metadata {
				sentenceStructure: [String]!
				syllableStructure: [String]!
			}

			type Note {
				note: String
			}

			type Query {
				phonemes: [Phoneme]
				symbols: [Symbol]
				phonotacticRules: [PhonotacticRule]
				conjugations: [Conjugation]
				words: [Word]
				metadata: Metadata
				notes: [Note]
			}
		`,
		headers: {
			"Authentication": "Bearer " + adminChildKey
		}
	});
	console.log(2)


	// step 3
	// get reference to child db client
	const childClient = new Client({
		secret: adminChildKey
	});

	console.log(adminChildKey)

	// create a role with specific privileges
	await childClient.query(
		q.CreateRole({
			name: 'public',
			privileges: [
				'Phoneme',
				'Symbol',
				'PhonotacticRule',
				'Conjugation',
				'Word',
				'Metadata',
				'Note'
			].map(collection => ({
				resource: q.Collection(collection),
				actions: {
					'create': true,
					'read': true,
					'update': true,
					'delete': true
				}
			}))
		})
	);
	console.log(3)


	// step 4
	// create key for child database
	const publicChildKey = (
		await childClient.query(
			q.CreateKey({
				name: 'public',
				role: 'public'
			})
		)
	).secret;
	console.log(4)


	// step 5
	// create document in parent collection
	await parentClient.query(
		q.Create(
			q.Collection('Language'),
			{
				data: {
					dbName,
					key: publicChildKey,
					name,
					creatorName,
					creatorEmail
				}
			}
		)
	);
	console.log(5)

	return JSON.stringify({ key: publicChildKey });
};

exports.handler = async ev =>
	ev.httpMethod != "POST"
		? { statusCode: 404 }
		: {
			statusCode: 200,
			body: await createLanguage(JSON.parse(ev.body))
		};
