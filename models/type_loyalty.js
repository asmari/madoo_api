const Sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const Loyalty = require('./loyalty');

const LoyaltyType = model.define('type_loyalty', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	tableName: 'type_loyalty',
	freezeTableName: true,
});

LoyaltyType.hasMany(Loyalty.Get, {
	foreignKey: 'type_loyalty_id',
	sourceKey: 'id',
});

exports.Get = LoyaltyType;
