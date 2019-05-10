const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const model = require('./conn/sequelize').sequelize;

const Loyalty = require('./loyalty').Get;
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
