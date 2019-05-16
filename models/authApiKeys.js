const sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const AuthApiKeys = model.define('auth_api_keys', {
	type_auth: {
		type: sequelize.STRING,
		allowNull: false,
	},
	client_id: {
		type: sequelize.STRING,
		allowNull: false,
	},
	client_secret: {
		type: sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'auth_api_keys',
});

exports.Get = AuthApiKeys;
