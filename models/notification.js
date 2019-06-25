const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const model = require('./conn/sequelize').sequelize;

const Loyalty = require('./loyalty').Get;
const Promo = require('./promo').Get;
const Transaction = require('./transaction').Get;
const NotificationMember = require('./notificationMember').Get;

const Notification = model.define('notification', {
	loyalty_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Loyalty,
			key: 'id',
		},
	},
	promo_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Promo,
			key: 'id',
		},
	},
	transaction_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Transaction,
			key: 'id',
		},
	},
	type: {
		type: sequelize.STRING,
		allowNull: false,
		maxLength: 10,
	},
	title: {
		type: sequelize.STRING,
		allowNull: false,
		maxLength: 255,
	},
	description: {
		type: sequelize.TEXT,
		allowNull: false,
	},
	valid_until: {
		type: sequelize.DATE,
		allowNull: false,
	},
	image: {
		type: sequelize.STRING,
		allowNull: true,
	},
	image_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
	click: {
		type: sequelize.STRING,
		allowNull: true,
		maxLength: 45,
	},
	campaign_name: {
		type: sequelize.STRING,
		allowNull: true,
	},
	template: {
		type: sequelize.STRING,
		allowNull: true,
	},
	template_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
	recipient: {
		type: sequelize.TEXT,
		allowNull: true,
	},
	recipient_type: {
		type: sequelize.STRING,
		allowNull: false,
	},
	recipient_count: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	recipient_file: {
		type: sequelize.STRING,
		allowNull: true,
	},
}, {
	timestamps: true,
	paranoid: true,
	deletedAt: 'deleted_at',
	underscored: true,
	freezeTableName: true,
});

// Notification.hasOne(Loyalty);
Notification.hasOne(NotificationMember, {
	foreignKey: 'notification_id',
});

Notification.hasMany(NotificationMember, {
	foreignKey: 'notification_id',
	as: 'notification_members',
});

sequelizePaginate.paginate(Notification);

exports.Get = Notification;
