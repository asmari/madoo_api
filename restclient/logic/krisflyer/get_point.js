module.exports = async () => {
	const res = {
		status: true,
		data: [],
	};

	res.data.push({
		value: 0,
		displayName: 'point_balance',
		keyName: 'point_balance',
	});

	return res;
};
