exports.Success = (data = null, message = null, code = 200) => ({
	status: true, code, message, data,
});

exports.Fail = (err, code = 500) => {
	if (err != null && Object.prototype.hasOwnProperty.call(err, 'statusCode')) {
		return { status: false, code: err.statusCode, message: err.message };
	}
	return { status: false, code, message: err.message };
};

exports.Paginate = (paginate = {}, data = null, message = null, code = 200) => ({
	status: code,
	message,
	data: {
		data: (data != null ? data : paginate.docs) || {},
		per_page: paginate.item || 0,
		total_items: paginate.total || 0,
		current_page: paginate.pages || 1,
	},
});
