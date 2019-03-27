
const Sequelize = require('sequelize');
const connect = require('./conn/sequelize');

const model = connect.sequelize;

const Members = require('./members');

const DeviceNotification = model.define('device_notification', {
	members_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Members.Get,
			key: 'id',
		},
	},
	device_id: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Device ID is required',
			},
		},
	},
	fcm_token: {
		type: Sequelize.STRING,
	},
	device_type: {
		type: Sequelize.STRING,
	},
	device_info: {
		type: Sequelize.STRING,
	},
}, {
	timestamps: true,
	freezeTableName: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
});

exports.Get = DeviceNotification;
