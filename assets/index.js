const FAUNA_PUBLIC_KEY = `fnAEbvuLBAAARa5iCEdtUjvBKVXZQE26EPqpvBEW`;

const createLanguage = async (name, creatorName, creatorEmail) => {
	const response = await fetch(
		"/api/language",
		{
			method: "POST",
			body: JSON.stringify({ name, creatorName, creatorEmail })
		}
	);
	localStorage.credentials = (await response.json()).key;
	alert(`The key for this language is '${localStorage.credentials}' minus the quotes. Please save that in your password manager, as you won't see it again, and you'll need it to access your language from now on.`);
};

const login = async credentials => {
	localStorage.credentials = credentials;
};

const getLanguage = async () => {
	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			method: "POST",
			body: JSON.stringify({ query: `
				query {
					getLanguageByKey (key: "${localStorage.credentials}") {
						name
						creatorName
						creatorEmail
					}
				}
			` }),
			headers: { "Authorization": `Bearer ${FAUNA_PUBLIC_KEY}` }
		}
	);
	const results = await response.json();
	return results;
};

const updateLanguage = async () => {
	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			method: "POST",
			body: JSON.stringify({  }),
			headers: { "Authorization": `Bearer ${localStorage.credentials}` }
		}
	);
	const results = await response.json();
};

const deleteLanguage = async () => {
	const response = await fetch(
		"https://graphql.us.fauna.com/graphql",
		{
			method: "POST",
			body: JSON.stringify({  }),
			headers: { "Authorization": `Bearer ${localStorage.credentials}` }
		}
	);
	const results = await response.json();
};
