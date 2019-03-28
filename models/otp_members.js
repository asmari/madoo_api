const Sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const MembersRegister = require('./members_register');

const OtpMembers = model.define('otp_members', {
	members_register_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		references: {
			model: MembersRegister.Get,
			key: 'id',
		},
	},
	uid: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Uid is required',
			},
		},
	},
	resourceUri: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	msisdn: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	attempt: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	expiresAt: {
		type: Sequelize.STRING,
	},
	nextSmsAfter: {
		type: Sequelize.STRING,
	},
	error_message: {
		type: Sequelize.STRING,
	},
}, {
	timestamps: true,
	freezeTableName: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
});

exports.Get = OtpMembers;
