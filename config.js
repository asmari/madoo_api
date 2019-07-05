exports.get = {
	serverPort: process.env.SERVER_PORT || 3000,
	db: {
		username: process.env.DB_USERNAME || '',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || '',
		driver: process.env.DB_DRIVER || 'mysql',
		host: process.env.DB_HOST || '127.0.0.1',
		port: process.env.DB_PORT || '3306',
	},
	sms: {
		subAccount: process.env.SMS_SUB_ACCOUNTS,
		token: process.env.SMS_TOKEN,
	},
	url: process.env.BASE_URL,
	fcm: {
		key: process.env.FIREBASE_KEY,
		url: process.env.FIREBASE_URL,
	},
	app_env: process.env.APP_ENV,
	cms: process.env.CMS_URL,
	mail: {
		apiKey: process.env.SENDINBLUE_APIKEY,
	},
	tz: process.env.TZ,
};
