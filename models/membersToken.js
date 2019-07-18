const Sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const membersToken = model.define('members_token', {
	members_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	token: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	timestamps: true,
	underscored: true,
	tableName: 'members_token',
	freezeTableName: true,
	paranoid: true,
	deletedAt: 'deleted_at',
});

exports.Get = membersToken;
