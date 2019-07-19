const Sequelize = require('sequelize');
const config = require('../../config').get;
const Logger = require('../../helper/Logger').Query;

exports.sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
	host: config.db.host,
	port: config.db.port,
	dialect: config.db.driver,
	logging: (str) => {
		Logger.info(str);
	},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	timezone: config.tz,
	dialectOptions: {
		// useUTC: false,
		// dateStrings: true,
		// typeCast: true,
	},
	// http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
	operatorsAliases: false,
});
