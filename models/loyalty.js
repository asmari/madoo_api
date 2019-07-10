const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

// const LoyaltyMemberCards = require("./loyalty_member_cards")
const Promo = require('./promo');
const ConvertionRate = require('./convertion_rate');
const Conversion = require('./conversion');
const MasterUnit = require('./master_unit');
const BusinessPartner = require('./business_partner');
const LoyaltyType = require('./type_loyalty');

const Loyalty = model.define('loyalty', {
	unit_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		references: {
			model: MasterUnit.Get,
			key: 'id',
		},
	},
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
	api_refresh_token: {
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
	// manage: {
	// 	type: Sequelize.INTEGER,
	// 	len: 11,
	// },
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
	unit: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	longlogo: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	image_url_longlogo: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	bglogo: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	image_url_bglogo: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	text_color: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	wording_note: {
		type: Sequelize.TEXT,
		allowNull: true,
		require: false,
	},
	enable_trx: {
		type: Sequelize.TINYINT,
		allowNull: false,
		defaultValue: true,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'loyalty',
	timezone: '+07:00',
	classMethods: {
		associate: (models) => {
			Loyalty.belongsTo(models.LoyaltyMemberCards);
		},
	},
	defaultScope: {
		include: [
			{
				model: MasterUnit.Get,
			},
			{
				model: BusinessPartner.Get,
				required: true,
			},
			{
				model: LoyaltyType.Get,
				required: true,
			},
		],
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

Loyalty.hasOne(MasterUnit.Get, {
	foreignKey: 'id',
});

Loyalty.hasMany(LoyaltyType.Get, {
	foreignKey: 'id',
	sourceKey: 'type_loyalty_id',
});

// round way to get has one functional
const unit = Loyalty.associations[MasterUnit.Get.name];
unit.sourceIdentifier = 'unit_id';
unit.sourceKey = 'unit_id';
unit.sourceKeyAttribute = 'unit_id';
unit.sourceKeyIsPrimary = false;

Loyalty.hasMany(BusinessPartner.Get, {
	foreignKey: 'id',
	sourceKey: 'business_partner_id',
});

// const business = Loyalty.associations[BusinessPartner.Get.name];
// business.sourceIdentifier = 'business_partner_id';
// business.sourceKey = 'business_partner_id';
// business.sourceKeyAttribute = 'business_partner_id';
// business.sourceKeyIsPrimary = false;

sequelizePaginate.paginate(Loyalty);

exports.Get = Loyalty;
