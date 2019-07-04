const Sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const MasterUnit = model.define('master_unit', {
	title: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	unit: {
		type: Sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	paranoid: true,
	deletedAt: 'deleted_at',
	underscored: true,
	freezeTableName: true,
	tableName: 'master_unit',
});

exports.Get = MasterUnit;
