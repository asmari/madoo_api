const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

// const Loyalty = require('./loyalty').Get;

const ConvertionRate = model.define('conversion_rate', {
	loyalty_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		max: 10,
	},
	conversion_loyalty: {
		type: sequelize.INTEGER,
		allowNull: false,
		max: 10,

	},
	point_loyalty: {
		type: sequelize.DOUBLE,
		allowNull: false,
	},
	point_conversion: {
		type: sequelize.DOUBLE,
		allowNull: false,
	},
	max_monthly: {
		type: sequelize.FLOAT,
		allowNull: true,
	},
	mid_from_rate: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	mid_to_rate: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	fee: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	minimum: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	multiple: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	enable_trx: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	tableName: 'conversion_rate',
});

// Loyalty.belongsTo(ConvertionRate, {
// 	foreignKey: 'id',
// 	targetKey: 'loyalty_id',
// 	as: 'LoyaltySource',
// });
//
// Loyalty.belongsTo(ConvertionRate, {
// 	foreignKey: 'id',
// 	targetKey: 'conversion_loyalty',
// 	as: 'LoyaltyTarget',
// });
sequelizePaginate.paginate(ConvertionRate);
exports.Get = ConvertionRate;
