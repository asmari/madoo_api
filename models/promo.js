const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;

const Loyalty = require('./loyalty');

const Promo = model.define('promo', {
	loyalty_id: {
		type: sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Loyalty id is required',
			},
		},
		references: {
			model: Loyalty.Get,
			key: 'id',
		},
	},
	title: {
		type: sequelize.STRING,
		allowNull: false,
	},
	body: {
		type: sequelize.STRING,
		allowNull: false,
	},
	image: {
		type: sequelize.STRING,
		allowNull: true,
	},
	valid_until: {
		type: sequelize.DATE,
		allowNull: false,
	},
	isfeatured: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	valid_until_end: {
		type: sequelize.DATE,
		allowNull: true,
		get() {
			const date = this.getDataValue('valid_until_end');
			if (date != null) {
				const d = new Date(date);
				return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
			}
			return date;
		},
	},
	status: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	typeloyalty_id: {
		type: sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'promo',
});
sequelizePaginate.paginate(Promo);
exports.Get = Promo;
