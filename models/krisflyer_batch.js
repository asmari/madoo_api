const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const KrisflyerBatch = model.define('krisflayer_batch_upload_detail', {
	batch_name: {
		type: sequelize.STRING,
		allowNull: false,
	},
	status: {
		type: sequelize.STRING,
		allowNull: false,
	},
	total_conversion: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
}, {
	timestamps: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	tableName: 'krisflayer_batch_upload_detail',
});

module.exports = KrisflyerBatch;
