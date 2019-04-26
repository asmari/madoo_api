const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

// const Loyalty = require('./loyalty').Get;

const Conversion = model.define('conversion', {
	loyalty_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		max: 10,
	},
	role: {
		type: sequelize.STRING,
		allowNull: false,

	},
	data_conversion: {
		type: sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	tableName: 'conversion',
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
sequelizePaginate.paginate(Conversion);
exports.Get = Conversion;
