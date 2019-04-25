const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const Wording = model.define('wording_content', {
	lang: {
		type: sequelize.STRING,
		allowNull: false,
	},
	version: {
		type: sequelize.STRING,
		allowNull: false,
	},
	wording: {
		type: sequelize.TEXT,
		allowNull: false,
	},
}, {
	timestamps: true,
	paranoid: true,
	deletedAt: 'deleted_at',
	underscored: true,
	tableName: 'wording_content',
	freezeTableName: true,
});

exports.Get = Wording;
