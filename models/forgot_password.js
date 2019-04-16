const sequilize = require('sequelize');

const model = require('./conn/sequelize').sequelize;


const ForgotPassword = model.define('forgot_password', {
	members_id: {
		type: sequilize.INTEGER,
		allowNull: false,
		maxLength: 10,
	},
	otp: {
		type: sequilize.INTEGER,
	},
	expiresAt: {
		type: sequilize.DATE,
	},
	error_message: {
		type: sequilize.STRING,
	},
	wrong: {
		type: sequilize.INTEGER,
	},
	webhook_status: {
		type: sequilize.TEXT,
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
