const messageBag = require('./message');

exports.ErrorResponse = class ErrorResponse extends Error {
	constructor(code, params, data = null) {
		super();
		this.statusCode = parseInt(code.toString().substring(0, 3), 10);
		this.code = code;
		this.message = messageBag.getMessage(code, params);
		this.data = data;
	}
};

exports.Response = class Response {
	constructor(code, data, message = null) {
		if (message == null) {
			this.message = messageBag.getMessage(code);
		} else {
			this.message = message;
		}

		this.code = code;
		this.data = data;
	}
};

exports.ResponsePaginate = class ResponsePaginate {
	constructor(code, paginate = {}, data = null, message = null) {
		this.code = code;
		if (message == null) {
			this.message = messageBag.getMessage(code);
		} else {
			this.message = message;
		}
		this.data = {
			data: (data != null ? data : paginate.docs) || {},
			per_page: paginate.item || 0,
			total_items: paginate.total || 0,
			current_page: paginate.pages || 1,
		};
	}
};

exports.CodeResponse = messageBag.validations;
