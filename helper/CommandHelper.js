const randomstring = require('randomstring');
const { Op } = require('sequelize');
const Table = require('cli-table');

const model = require('../models/index');

const AuthApiKeys = model.AuthApiKeys.Get;

exports.createApiKeys = async (typeAuth = 'vendor') => {
	const clientId = randomstring.generate(22);
	const clientSecret = randomstring.generate(42);

	const table = new Table({
		head: ['Auth', 'Client ID', 'Client Secret'],
		colWidths: [16, 25, 50],
	});

	const auth = await AuthApiKeys.count({
		where: {
			type_auth: {
				[Op.like]: `${typeAuth}%`,
			},
		},
	});

	let typeAuthNew = typeAuth;

	if (auth > 0) {
		typeAuthNew = `${typeAuth}_${auth}`;
	}

	const authApiKey = await AuthApiKeys.create({
		type_auth: typeAuthNew,
		client_id: clientId,
		client_secret: clientSecret,
	});

	table.push([
		authApiKey.type_auth,
		authApiKey.client_id,
		authApiKey.client_secret,
	]);

	return table.toString();
};

exports.getListApiKey = async () => {
	const authApiKeys = await AuthApiKeys.findAll();

	const table = new Table({
		head: ['Auth', 'Client ID', 'Client Secret'],
		colWidths: [16, 25, 50],
	});

	if (authApiKeys) {
		authApiKeys.forEach((value) => {
			table.push([
				value.type_auth,
				value.client_id,
				value.client_secret,
			]);
		});
	}

	return table.toString();
};
