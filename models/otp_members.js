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
	otp: {
		type: Sequelize.INTEGER,
	},
	expiresAt: {
		type: Sequelize.DATE,
	},
	error_message: {
		type: Sequelize.STRING,
	},
	wrong: {
		type: Sequelize.INTEGER,
	},
	webhook_status: {
		type: Sequelize.TEXT,
	},
	resend_count: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	last_resend: {
		type: Sequelize.DATE,
		allowNull: false,
	},
}, {
	timestamps: true,
	freezeTableName: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
});

exports.Get = OtpMembers;
