const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

// const LoyaltyMemberCards = require("./loyalty_member_cards")
const Promo = require('./promo');
const ConvertionRate = require('./convertion_rate');
const Conversion = require('./conversion');

const Loyalty = model.define('loyalty', {
	type_loyalty_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	business_partner_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	about: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	image: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	image_url: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	bg_color: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	api_user_detail: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	api_user_point: {
		type: Sequelize.TEXT,
	},
	api_point_plus: {
		type: Sequelize.TEXT,
	},
	api_point_minus: {
		type: Sequelize.TEXT,
	},
	// company: {
	// 	type: Sequelize.STRING,
	// 	len: 100,
	// },
	min_convertion: {
		type: Sequelize.INTEGER,
		len: 11,
	},
	// multiple: {
	// 	type: Sequelize.INTEGER,
	// 	len: 11,
	// },
	type_id: {
		type: Sequelize.STRING,
		len: 20,
	},
	manage: {
		type: Sequelize.INTEGER,
		len: 11,
	},
	new_link: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	ledger_id: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	auth: {
		type: Sequelize.TINYINT,
		allowNull: false,
	},
	auth_field: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	confirm_field: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'loyalty',
	classMethods: {
		associate: (models) => {
			Loyalty.belongsTo(models.LoyaltyMemberCards);
		},
	},
});

Promo.Get.belongsTo(Loyalty, {
	sourceKey: 'loyalty_id',
});

Conversion.Get.belongsTo(Loyalty, {
	sourceKey: 'loyalty_id',
});

Loyalty.hasMany(Promo.Get, {
	sourceKey: 'Loyalty.id',
	foreignKey: 'loyalty_id',
});
ConvertionRate.Get.belongsTo(Loyalty, {
	foreignKey: 'loyalty_id',
	targetKey: 'id',
	as: 'Source',
});
ConvertionRate.Get.belongsTo(Loyalty, {
	foreignKey: 'conversion_loyalty',
	targetKey: 'id',
	as: 'Target',
});

Loyalty.hasMany(ConvertionRate.Get, {
	sourceKey: 'id',
	foreignKey: 'loyalty_id',
	as: 'LoyaltySource',
});

Loyalty.hasMany(ConvertionRate.Get, {
	sourceKey: 'id',
	foreignKey: 'conversion_loyalty',
	as: 'LoyaltyTarget',
});


sequelizePaginate.paginate(Loyalty);

exports.Get = Loyalty;
