// const flat = require('flat');
const xmlBuilder = require('xmlbuilder');
const querystring = require('querystring');
const flat = require('flat');
const randomstring = require('randomstring');
const isBuffer = require('is-buffer');
const aws4 = require('aws4');
const moment = require('moment');


const { ErrorResponse } = require('../helper/response');
const Request = require('./request');
const Logger = require('../helper/Logger').RestClient;
const Config = require('../config');

module.exports = class RestClient extends Request {
	constructor(obj) {
		super();
		this.api = null;

		Logger.info('========================================================================');

		Logger.info('RUN LOYALTY', obj);

		if (Object.prototype.hasOwnProperty.call(obj, 'auth')) {
			const supportedAuth = ['oauth2', 'oauth', 'jwt', 'aws-v4'];
			const { auth } = obj;

			supportedAuth.forEach((value) => {
				if (Object.prototype.hasOwnProperty.call(auth, value)) {
					if (value === 'aws-v4') {
						this.authType = value;
						this.auth = auth;
					} else {
						this.auth = new RestClient(auth[value]);
						this.authType = value;
					}
				}
			});
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'agent')) {
			this.createAgent(obj.agent);
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'header')) {
			this.createHeaders(obj.header);
			this.currentHeader = obj.header;
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'api')) {
			this.api = obj.api;
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'methode')) {
			this.method = obj.methode;
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'body')) {
			this.reqBody = obj.body;
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'response')) {
			if (Object.prototype.hasOwnProperty.call(obj.response, 'static') && obj.response.static === true) {
				this.staticResponse = true;
			}

			if (Object.prototype.hasOwnProperty.call(obj.response, 'return_body')) {
				this.returnBodyResponse = obj.response.return_body;
			}

			this.responseFilter = obj.response;
		}

		this.checkResponse = [];

		this.lang = 'en';
	}

	setLanguage(lang) {
		this.lang = lang;
	}

	setAuthToken() {
		this.hasAuthToken = true;
	}

	hasAuth() {
		return Object.prototype.hasOwnProperty.call(this, 'auth');
	}

	getAuthType() {
		return this.authType;
	}

	removeAuth() {
		this.auth = null;
		this.authType = null;
	}

	insertBody(data = {}) {
		this.bodyData = data;

		Logger.info('INSERT BODY', data);

		if (this.auth != null && this.authType !== 'aws-v4') {
			this.auth.insertBody(data);
		}

		try {
			return this.parsingBody();
		} catch (err) {
			console.error(err);
			return err;
		}
	}

	getContentType() {
		let contentType = 'application/json';

		Object.keys(this.getHeaders()).forEach((key) => {
			if (key.toLocaleLowerCase() === 'content-type') {
				contentType = this.getHeader(key);
			}
		});

		return contentType;
	}

	parsingBody() {
		let contentType = 'application/json';
		let parsedBody = {};

		Object.keys(this.getHeaders()).forEach((key) => {
			if (key.toLocaleLowerCase() === 'content-type') {
				contentType = this.getHeader(key);
			}
		});

		contentType = contentType.split(';')[0] || contentType;

		if (this.reqBody != null) {
			const { required, properties, checkResponse } = this.reqBody;
			const body = this.bodyData;

			if (required.length > 0) {
				required.forEach((value) => {
					let keyValue = value;

					if (typeof value === 'object') {
						if (Object.prototype.hasOwnProperty.call(value, 'keyName')) {
							keyValue = value.keyName;
						}
					}

					if (!Object.prototype.hasOwnProperty.call(body, keyValue)) {
						throw new Error(`${keyValue} is not found`);
					}
				});
			}

			if (Object.prototype.hasOwnProperty.call(this.reqBody, 'checkResponse') && checkResponse.length > 0) {
				checkResponse.forEach((value) => {
					let keyValue = value;
					let typeValue = 'string';

					if (typeof value === 'object') {
						if (Object.prototype.hasOwnProperty.call(value, 'keyName')) {
							keyValue = value.keyName;
						}

						if (Object.prototype.hasOwnProperty.call(value, 'type')) {
							typeValue = value.type;
						}
					}

					if (!Object.prototype.hasOwnProperty.call(body, keyValue)) {
						throw new Error(`${keyValue} is not found`);
					} else {
						this.checkResponse.push({
							keyName: keyValue,
							value: RestClient.tryParsingByType(typeValue, body[keyValue]),
						});
					}
				});
			}

			Object.keys(properties).forEach((key) => {
				const value = properties[key];

				if (value.substr(0, 1) === ':') {
					const stripedValue = value.replace(':', '');
					if (Object.prototype.hasOwnProperty.call(body, stripedValue)) {
						parsedBody[key] = body[stripedValue];
					}
				} else if (value.substr(0, 1) === '@') {
					const stripedValue = value.replace('@', '');
					const annotValue = RestClient.getAnnotationFunc(stripedValue);
					parsedBody[key] = annotValue;
				} else {
					parsedBody[key] = value;
				}
			});
		}

		parsedBody = RestClient.unflatten(parsedBody);


		switch (contentType.toLocaleLowerCase()) {
		case 'application/xml':
		case 'text/xml':

			parsedBody = xmlBuilder.create(parsedBody).end({
				pretty: true,
			});

			break;

		case 'application/x-www-form-urlencoded':
		case 'multipart/form-data':
			parsedBody = querystring.stringify(parsedBody);
			break;

		case 'application/json':
		case 'text/json':
			parsedBody = JSON.stringify(parsedBody);
			break;
		default:

			break;
		}

		if (Object.keys(parsedBody).length === 0) {
			parsedBody = null;
		}

		this.parsedBody = parsedBody;
		return true;
	}

	static findFromArray($array, key) {
		return $array.find(value => value.keyName === key);
	}

	async request() {
		const responseAll = {};

		Logger.info('TOKENBOWO', this.authType);

		if (this.auth != null && !Object.prototype.hasOwnProperty.call(this, 'hasAuthToken') && this.authType !== 'aws-v4') {
			if (this.auth instanceof Request || this.authType !== 'aws-v4') {
				try {
					const responseAuth = await this.auth.request();

					Logger.info('DOING AUTH', this.auth);

					switch (this.authType) {
					case 'oauth2':

						// eslint-disable-next-line no-case-declarations
						const token = RestClient.findFromArray(responseAuth.data, 'token');

						this.changeHeader('Authorization', `Bearer ${token.value}`);

						Object.assign(responseAll, {
							auth: {
								oauth2: responseAuth.data,
							},
						});
						break;

					default:
						break;
					}
				} catch (err) {
					console.log('Error Test', err);
				}
			}
		} else {
			switch (this.authType) {
			case 'aws-v4':
				// eslint-disable-next-line no-case-declarations
				const url = new URL(this.api);

				// eslint-disable-next-line no-case-declarations
				const awsAuth = this.auth['aws-v4'];

				// eslint-disable-next-line no-case-declarations
				const token = aws4.sign({
					host: url.host,
					path: url.pathname,
					service: awsAuth.service_name,
					region: awsAuth.region,
					method: 'POST',
					body: this.parsedBody,
					headers: {
						'Content-Type': this.currentHeader['Content-type'] || 'application/json',
						Date: new Date().toLocaleString('en-US', { timeZone: Config.get.tz }),
					},
				}, {
					secretAccessKey: awsAuth.secret,
					accessKeyId: awsAuth.key,
				});

				this.createHeaders(token.headers);


				break;

			default:
				break;
			}
		}

		if (Object.prototype.hasOwnProperty.call(this, 'staticResponse')) {
			let data = {};
			if (Object.prototype.hasOwnProperty.call(this, 'returnBodyResponse') && this.returnBodyResponse === true) {
				data = this.parsedBody;
			}

			if (typeof data !== 'object') {
				data = JSON.parse(data);
			}

			const responseFiltered = this.getFilterValue(data);
			Object.assign(responseAll, responseFiltered);
		} else {
			const response = await super.request(this.api, this.method, this.parsedBody);

			Logger.info('GET RESPONSE', response);

			const responseFiltered = this.getFilterValue(response);

			Logger.info('RESPONSE FILTERED', responseFiltered);

			Object.assign(responseAll, responseFiltered);
		}

		Logger.info('BODY', this.parsedBody);

		Logger.info('========================================================================');

		return responseAll;
	}

	isOptional(value) {
		const { optional } = this.reqBody;
		let isTrue = false;

		optional.forEach((val) => {
			if (val === value) {
				isTrue = true;
			}
		});

		return isTrue;
	}

	static getAnnotationFunc(funcName) {
		let value = '';
		const date = new Date();

		switch (funcName) {
		case 'NOWSPACE':
			value = moment().format('YYYYMMDDHHmmss');
			break;
		case 'NOWATOM':
			value = new Date().toISOString();
			break;

		case 'RANDNUM':
			value = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
			break;

		case 'RANDALPHA':
			value = randomstring.generate({ length: 20 });
			break;

		case 'TODAY':
			value = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
			break;

		default:
			value = 'noVal';
			break;
		}

		return value;
	}

	static tryParsingByType(type, value) {
		switch (type) {
		case 'number':
			return Number.isNaN(value) ? 0 : parseInt(value, 10);

		case 'string':
			return typeof value === 'string' ? value : '';

		case 'date':
		case 'datetime':
			return new Date(value);
		default:
			return value;
		}
	}

	getFilterValue(response) {
		let resultResponse = {};
		const resultResponses = [];

		const filter = this.responseFilter;
		const flatened = flat.flatten(response);
		let code = null;
		let valueType = 'string';


		if (Object.prototype.hasOwnProperty.call(flatened, filter.code)) {
			code = flatened[filter.code];
		}

		let propResponse = {};

		if (Object.prototype.hasOwnProperty.call(filter.status, code)) {
			propResponse = filter.status[code];
		} else {
			propResponse = filter.status.$default;
		}

		Object.keys(propResponse.properties).forEach((key) => {
			let keyLink = propResponse.properties[key];
			let displayName = null;


			valueType = 'string';

			if (typeof keyLink === 'object') {
				const objValue = keyLink;

				if (Object.prototype.hasOwnProperty.call(objValue, 'value')) {
					keyLink = objValue.value;
				}

				if (Object.prototype.hasOwnProperty.call(objValue, 'type')) {
					valueType = objValue.type;
				}

				if (Object.prototype.hasOwnProperty.call(objValue, 'displayName')) {
					switch (typeof objValue.displayName) {
					case 'string':
						// eslint-disable-next-line prefer-destructuring
						displayName = objValue.displayName;
						break;
					case 'object':
						// eslint-disable-next-line no-case-declarations
						const keyData = Object.keys(objValue.displayName);

						keyData.forEach((value) => {
							if (value === this.lang) {
								displayName = objValue.displayName[value];
							}
						});

						if (displayName == null && keyData.length > 0) {
							displayName = objValue.displayName[keyData[0]];
						}

						break;

					default:
						break;
					}
				}
			}

			const keyLinkSplit = keyLink.split('.');

			const filterIndex = keyLinkSplit.findIndex(ele => ele.substr(0, 1) === '@');

			if (filterIndex !== -1) {
				resultResponse[key] = RestClient.runFilterFunction(response, keyLinkSplit, filterIndex);
			} else {
				resultResponse[key] = flatened[keyLink];
			}

			switch (valueType) {
			case 'number':
				// eslint-disable-next-line max-len
				resultResponse[key] = Number.isNaN(resultResponse[key]) ? -1 : parseInt(resultResponse[key], 10);
				break;

			case 'double':
			case 'float':
				resultResponse[key] = parseFloat(resultResponse[key]);
				break;

			case 'date':
			case 'datetime':
				resultResponse[key] = new Date(resultResponse[key]);
				break;

			default:
				break;
			}

			if (displayName == null) {
				displayName = key;
			}

			if (this.checkResponse.length > 0) {
				this.checkResponse.forEach((valKey) => {
					if (key === valKey.keyName) {
						switch (valueType) {
						case 'date':
							// eslint-disable-next-line no-case-declarations
							const d1 = resultResponse[key];
							// eslint-disable-next-line no-case-declarations
							const d = new Date(`${valKey.value.getFullYear()}-${valKey.value.getMonth() + 1}-${valKey.value.getDate()}`);

							// eslint-disable-next-line no-case-declarations
							const isValid = {
								date: d1.getDate() === d.getDate(),
								month: d1.getMonth() === d.getMonth(),
								year: d1.getFullYear() === d.getFullYear(),
							};

							if (!isValid.date || !isValid.month || !isValid.year) {
								throw new ErrorResponse(41714, {
									field: displayName,
								});
							}

							resultResponse[key] = `${d1.getFullYear()}/${d1.getMonth() + 1}/${d1.getDate()}`;
							break;
						case 'datetime':
							if (resultResponse[key].getTime() !== valKey.value.getTime()) {
								throw new ErrorResponse(41714, {
									field: displayName,
								});
							}
							break;

						default:
							if (resultResponse[key] !== valKey.value) {
								throw new ErrorResponse(41714, {
									field: displayName,
								});
							}
							break;
						}
					}
				});
			}

			resultResponses.push({
				value: resultResponse[key],
				displayName,
				keyName: key,
			});
		});


		resultResponse = {
			status: propResponse.success,
			data: resultResponses,
		};

		return resultResponse;
	}

	static runFilterFunction(response, keyLinkSplit, index) {
		const keySplit = keyLinkSplit[index].split('(');
		const keyFunc = keySplit[0].replace('@', '').trim();
		const keyArgs = keySplit[1].replace(')', '').split(',').map(value => value.trim());
		let result = 'noval';

		switch (keyFunc) {
		case 'zero':
			result = 0;
			break;
		case 'null':
			result = null;
			break;
		case 'sort':

			// eslint-disable-next-line no-case-declarations
			let tempObj = response;
			// eslint-disable-next-line no-case-declarations
			const target = keyArgs[0].split('->');

			// eslint-disable-next-line no-plusplus
			for (let i = 0; i <= index; i++) {
				if (Object.prototype.hasOwnProperty.call(tempObj, keyLinkSplit[i])) {
					tempObj = tempObj[keyLinkSplit[i]];
				}
			}

			if (Array.isArray(tempObj)) {
				tempObj = tempObj.sort((a, b) => {
					const targets = target.join('.');

					const tempA = flat.flatten(a);
					const tempB = flat.flatten(b);
					let comparison = 0;

					const valA = parseInt(tempA[targets], 10) || tempA[targets];
					const valB = parseInt(tempB[targets], 10) || tempB[targets];

					if (valA > valB) {
						comparison = 1;
					} else if (valA < valB) {
						comparison = -1;
					}

					return comparison;
				});

				if (keyArgs[1] === 'asc') {
					// eslint-disable-next-line prefer-destructuring
					tempObj = tempObj[0];
				} else {
					tempObj = tempObj[tempObj.length - 1];
				}
			}


			result = flat.flatten(tempObj)[keyLinkSplit.slice((index + 1), (keyLinkSplit.length)).join('.')];
			break;

		default:
			break;
		}

		return result;
	}

	// key
	static unflatten(target, opts = {}) {
		const result = {};

		const getkey = (key) => {
			const parsedKey = Number(key);
			// eslint-disable-next-line no-restricted-globals
			return (isNaN(parsedKey) || key.indexOf('.') !== -1 || opts.object) ? key : parsedKey;
		};

		if (target === undefined) {
			throw new Error('empty');
		}

		const isbuffer = isBuffer(target);
		if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
			return target;
		}

		Object.keys(target).forEach((key) => {
			const split = key.split('.');
			let key1 = getkey(split.shift());
			let key2 = getkey(split[0]);
			let recipient = result;

			while (key2 !== undefined) {
				const type = Object.prototype.toString.call(recipient[key1]);
				const isobject = (
					type === '[object Object]' || type === '[object Array]'
				);

				if (!isobject && typeof recipient[key1] !== 'undefined') {
					return;
				}

				if ((!isobject) || (recipient[key1] == null)) {
					recipient[key1] = (typeof key2 === 'number' && !opts.object ? [] : {});
				}

				recipient = recipient[key1];
				if (split.length > 0) {
					key1 = getkey(split.shift());
					key2 = getkey(split[0]);
				}
			}

			// unflatten again for 'messy objects'
			recipient[key1] = RestClient.unflatten(target[key], opts);
		});

		return result;
	}
};
