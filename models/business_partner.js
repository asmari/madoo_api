const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const BusinessPartner = model.define('business_partner', {
	name: {
		type: sequelize.STRING,
		allowNull: true,
	},
	manage: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	address: {
		type: sequelize.STRING,
		allowNull: true,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	tableName: 'business_partner',
});

exports.Get = BusinessPartner;
