const sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const Conversion = model.define('conversion_rules', {
	loyalty_from: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	loyalty_to: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
}, {
	paranoid: true,
	deletedAt: 'deleted_at',
	underscored: true,
	freezeTableName: true,
	tableName: 'conversion_rules',
});

exports.Get = Conversion;
