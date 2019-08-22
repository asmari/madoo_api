const https = require('https');
const parser = require('xml2json');

const Logger = require('../helper/Logger').RestClient;

module.exports = class Request {
	constructor() {
		this.agent = null;
		this.headers = {};
		this.retry = 5;
		this.alreadyTry = 1;
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

		Logger.info(`Start API ${url}`);

		return new Promise((resolve, reject) => {
			const onError = (err) => {
				Logger.info('Error Access, try Again');
				if (this.alreadyTry >= this.retry) {
					Logger.info('Limit Try Again');
					reject(err);
				} else {
					Logger.info(`Try Again ${this.alreadyTry}`);
					this.alreadyTry += 1;
					this.request(url, method, data, encoding)
						.then(newRes => resolve(newRes))
						.catch(error => reject(error));
				}
			};

			const req = https.request(url, {
				agent,
				headers,
				method,
				timeout: 20000,
			}, (res) => {
				let contentType = '';

				if (Object.prototype.hasOwnProperty.call(res.headers, 'content-type')) {
					contentType = res.headers['content-type'].indexOf(';') !== -1 ? res.headers['content-type'].split(';')[0] : res.headers['content-type'];
				}


				let chunkData = '';

				res.on('error', onError);

				res.on('data', (chunk) => {
					chunkData += chunk;
				});

				res.on('timeout', () => {
					Logger.info('Timeout - Error');
					res.abort();
					onError('timeout');
				});

				res.on('end', () => {
					let parsedData = null;

					if (res.statusCode > 299) {
						onError(res);
						return;
					}

					Logger.info(`Done Api ${url}`);

					switch (contentType) {
					case 'text/xml':
					case 'application/xml':
						parsedData = JSON.parse(parser.toJson(chunkData));
						break;

					case 'text/html':
					case 'application/html':
						break;

					default:
						try {
							parsedData = JSON.parse(chunkData);
						} catch (e) {
							Logger.info(e);
						}
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
