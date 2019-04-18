const sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const Members = require('./members').Get;

const NotificationMember = model.define('notification_members', {
	members_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 10,
		references: {
			model: Members,
			key: 'id',
		},
	},
	notification_id: {
		type: sequelize.INTEGER,
		allowNull: true,
		maxLength: 20,
	},
	read: {
		type: sequelize.BOOLEAN,
		maxLength: 1,
		allowNull: false,
		defaultValue: 0,
	},
}, {
	timestamps: true,
	paranoid: true,
	underscored: true,
	deletedAt: 'deleted_at',
	freezeTableName: true,
	tableName: 'notification_members',
});

exports.Get = NotificationMember;
