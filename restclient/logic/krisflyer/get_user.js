module.exports = async (params) => {
	const res = {
		status: true,
		data: [],
	};

	res.data.push({
		value: `${params.first_name} ${params.last_name}`,
		displayName: 'Full Name',
		keyName: 'full_name',
	});

	res.data.push({
		value: params.card_number,
		displayName: 'Card Number',
		keyName: 'card_number',
	});

	return res;
};
