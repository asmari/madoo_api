const https = require('https');
const parser = require('xml2json');

module.exports = class Request {
	constructor() {
		this.agent = null;
		this.headers = {};
	}

	createAgent(agent = null) {
		if (agent != null) {
			this.agent = new https.Agent(agent);
		}
	}

	changeHeader(key, value) {
		this.headers[key] = value;
	}

	getHeader(key = '') {
		return this.headers[key];
	}

	getHeaders() {
		return this.headers;
	}

	createHeaders(headers) {
		this.headers = headers;
	}

	post(url, data, encoding = 'utf-8') {
		return this.request(url, 'POST', data, encoding);
	}

	get(url, data, encoding = 'utf-8') {
		return this.request(url, 'GET', data, encoding);
	}

	request(url, method, data, encoding = 'utf-8') {
		const { agent, headers } = this;

		return new Promise((resolve, reject) => {
			const req = https.request(url, {
				agent,
				headers,
				method,
			}, (res) => {
				const contentType = res.headers['content-type'].split(';')[0] || res.headers['content-type'];

				let chunkData = '';

				res.on('error', (err) => {
					reject(err);
				});

				res.on('data', (chunk) => {
					chunkData += chunk;
				});

				res.on('end', () => {
					let parsedData = '';

					switch (contentType) {
					case 'text/xml':
					case 'application/xml':
						parsedData = parser.toJson(chunkData);
						break;

					case 'text/html':
					case 'application/html':
						break;

					default:
						parsedData = JSON.parse(chunkData);
						break;
					}

					resolve(parsedData);
				});
			});

			if (data != null) {
				req.write(data, encoding);
			}

			req.end();
		});
	}
};
