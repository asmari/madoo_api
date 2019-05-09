const Sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const UpdateMemberLogs = model.define('update_member_logs', {
	type: {
		type: Sequelize.STRING,
		allowNull: false,
		validations: {
			len: [2, 45],
		},
	},
	members_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	value_before: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	value_after: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	is_verified: {
		type: Sequelize.TINYINT,
		allowNull: false,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	tableName: 'update_member_logs',
	freezeTableName: true,
});


exports.Get = UpdateMemberLogs;
