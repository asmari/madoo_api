const yargs = require('yargs');
require('dotenv').config();

const { createApiKeys, getListApiKey } = require('./helper/CommandHelper');

const argv = yargs
	.command('create', 'Command for create authkeys, if name same will create indexes on name', args => args.option('n', {
		alias: 'name',
		type: 'string',
		demand: 'Please specify the name for auth key',
	}), async ({ name }) => {
		console.log(await createApiKeys(name));
		process.exit();
	})
	.command('list', 'List for authkeys', () => {}, async () => {
		console.log(await getListApiKey());
		process.exit();
	});

// eslint-disable-next-line no-unused-expressions
argv.argv;
