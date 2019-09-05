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
		source: process.env.SMS_SOURCE || 'MADOO',
		message: process.env.SMS_MESSAGE,
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
	iris: {
		url: process.env.IRIS_URL || 'https://app.sandbox.midtrans.com/iris/api/v1',
		payouts: process.env.IRIS_PAYOUTS || 'SVJJUy03MDg2YmIyOC1mMzgxLTQ1NjQtYTEzOS0wNzMyMzNhMzJjOWI6',
		approval: process.env.IRIS_APPROVE || 'SVJJUy00NzU5ZjI1ZS1iMzY5LTQ5ZDEtODRkOS1jZDk0MWFiNTE0MTY6',
	},
	email: {
		sender: process.env.EMAIL_SENDER || 'info@madoo.io',
		name: process.env.EMAIL_NAME || 'MADOO',
	},
};
