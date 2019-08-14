module.exports = async (params) => {
	const res = {
		status: true,
		data: [],
	};

	res.data.push({
		value: params.mobile_phone,
		displayName: 'Phone Number',
		keyName: 'mobile_number',
	});

	return res;
};
