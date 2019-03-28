const sequilize = require('sequelize');

const model = require('./conn/sequelize').sequelize;


const ForgotPassword = model.define('forgot_password', {
	members_id: {
		type: sequilize.INTEGER,
		allowNull: false,
		maxLength: 10,
	},
	uid: {
		type: sequilize.STRING,
		allowNull: false,
		maxLength: 150,
	},
	resourceUri: {
		type: sequilize.STRING,
		allowNull: false,
	},
	msisdn: {
		type: sequilize.STRING,
		allowNull: false,
		maxLength: 20,
	},
	status: {
		type: sequilize.STRING,
		allowNull: false,
		maxLength: 15,
	},
	attempt: {
		type: sequilize.INTEGER,
		allowNull: false,
		maxLength: 10,
	},
	expiresAt: {
		type: sequilize.STRING,
		allowNull: false,
		maxLength: 100,
	},
	nextSmsAfter: {
		type: sequilize.STRING,
		allowNull: false,
		maxLength: 100,
	},
	error_message: {
		type: sequilize.STRING,
		allowNull: true,
	},
}, {
	timestamps: true,
	paranoid: true,
	deletedAt: 'deleted_at',
	underscored: true,
	freezeTableName: true,
	tableName: 'forgot_password',
});


exports.Get = ForgotPassword;
