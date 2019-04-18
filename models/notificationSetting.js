const sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const Members = require('./members').Get;

const NotificationSetting = model.define('notification_setting', {
	members_id: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 10,
		references: {
			model: Members,
			key: 'id',
		},
	},
	promotion: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	conversion: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
	other: {
		type: sequelize.INTEGER,
		allowNull: false,
		maxLength: 11,
	},
}, {
	timestamps: true,
	paranoid: true,
	underscored: true,
	deletedAt: 'deleted_at',
	freezeTableName: true,
	tableName: 'notification_setting',
});

exports.Get = NotificationSetting;
