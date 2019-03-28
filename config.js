exports.get = {
	serverPort: process.env.SERVER_PORT || 3000,
	db: {
		username: process.env.DB_USERNAME || '',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || '',
		driver: process.env.DB_DRIVER || 'mysql',
		host: process.env.DB_HOST || '127.0.0.1',
	},
	sms: {
		subAccount: process.env.SMS_SUB_ACCOUNTS,
		token: process.env.SMS_TOKEN,
	},
	url: process.env.BASE_URL,
};
