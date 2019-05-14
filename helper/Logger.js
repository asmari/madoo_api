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
	},
	categories: {
		default: {
			appenders: ['GENERAL_LOG'], level: 'ERROR',
		},
		REFRESH_AUTH: {
			appenders: ['REFRESH_AUTH'], level: 'DEBUG',
		},
	},
});


exports.logger = log4js.getLogger();
exports.General = log4js.getLogger('GENERAL_LOG');
exports.RefreshAuth = log4js.getLogger('REFRESH_AUTH');
