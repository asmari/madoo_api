const log4js = require('log4js');

log4js.configure({
	appenders: {
		GENERAL_LOG: {
			type: 'file',
			filename: 'logs/current.log',
		},
		REFRESH_AUTH: {
			type: 'file',
			filename: 'logs/REFRESH_AUTH.log',
		},
		OTP_LOG: {
			type: 'file',
			filename: 'logs/OTP_LOG.log',
		},
		AUTH_API: {
			type: 'file',
			filename: 'logs/AUTH_API.log',
		},
	},
	categories: {
		default: {
			appenders: ['GENERAL_LOG'], level: 'ALL',
		},
		REFRESH_AUTH: {
			appenders: ['REFRESH_AUTH'], level: 'ALL',
		},
		OTP_LOG: {
			appenders: ['OTP_LOG'], level: 'ALL',
		},
		AUTH_API: {
			appenders: ['AUTH_API'], level: 'ALL',
		},
	},
});


exports.logger = log4js.getLogger();
exports.General = log4js.getLogger('GENERAL_LOG');
exports.RefreshAuth = log4js.getLogger('REFRESH_AUTH');
exports.OtpLog = log4js.getLogger('OTP_LOG');
exports.AuthApi = log4js.getLogger('AUTH_API');
