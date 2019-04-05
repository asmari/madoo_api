// const flat = require('flat');
const xmlBuilder = require('xmlbuilder');
const flat = require('flat');
const isBuffer = require('is-buffer');

const { ErrorResponse, Response } = require('../helper/response'); 
const Request = require('./request');

module.exports = class RestClient extends Request {
	constructor(obj) {
		super();
		this.api = null;

		if (Object.prototype.hasOwnProperty.call(obj, 'agent')) {
			this.createAgent(obj.agent);
		}

		if (Object.prototype.hasOwnProperty.call(obj, 'header')) {
			this.createHeaders(obj.header);
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
			this.responseFilter = obj.response;
		}
	}

	insertBody(data = {}) {
		this.bodyData = data;
		try {
			return this.parsingBody();
		} catch (err) {
			console.error(err);
			return err;
		}
	}

	parsingBody() {
		let contentType = 'application/json';

		Object.keys(this.getHeaders()).forEach((key) => {
			if (key.toLocaleLowerCase() === 'content-type') {
				contentType = this.getHeader(key);
			}
		});

		contentType = contentType.split(';')[0] || contentType;

		const { required, properties } = this.reqBody;
		const body = this.bodyData;

		if (required.length > 0) {
			required.forEach((value) => {
				if (!Object.prototype.hasOwnProperty.call(body, value)) {
					throw new Error(`${value} is not found`);
				}
			});
		}

		let parsedBody = {};

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


		parsedBody = RestClient.unflatten(parsedBody);

		switch (contentType.toLocaleLowerCase()) {
		case 'application/xml':
		case 'text/xml':

			parsedBody = xmlBuilder.create(parsedBody).end({
				pretty: true,
			});

			break;

		default:

			break;
		}

		this.parsedBody = parsedBody;
		return true;
	}

	async request() {
		const response = await super.request(this.api, this.method, this.parsedBody);

		const responseFiltered = this.getFilterValue(JSON.parse(response));

		return responseFiltered;
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
		switch (funcName) {
		case 'NOWATOM':
			value = new Date().toISOString();
			break;

		case 'RANDNUM':
			value = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
			break;

		default:
			value = 'noVal';
			break;
		}

		return value;
	}

	getFilterValue(response) {
		let resultResponse = {};

		try {
			const filter = this.responseFilter;
			const flatened = flat.flatten(response);
			let code = null;

			// console.log(flatened);

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
				const keyLink = propResponse.properties[key];
				const keyLinkSplit = keyLink.split('.');

				const filterIndex = keyLinkSplit.findIndex(ele => ele.substr(0, 1) === '@');

				if (filterIndex !== -1) {
					resultResponse[key] = RestClient.runFilterFunction(response, keyLinkSplit, filterIndex);
				} else {
					resultResponse[key] = flatened[keyLink];
				}
			});

			if (!propResponse.success) {
				resultResponse = new Error(resultResponse.message);
			}
		} catch (err) {
			console.error(err);
		}

		return resultResponse;
	}

	static runFilterFunction(response, keyLinkSplit, index) {
		const keySplit = keyLinkSplit[index].split('(');
		const keyFunc = keySplit[0].replace('@', '').trim();
		const keyArgs = keySplit[1].replace(')', '').split(',').map(value => value.trim());
		let result = 'noval';

		switch (keyFunc) {
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
