module.exports = async (params) => {
	const res = {
		status: true,
		pendingOnly: true,
		data: [],
	};

	res.data.push({
		value: params.point,
		displayName: 'point_balance',
		keyName: 'point_balance',
	});

	return res;
};
