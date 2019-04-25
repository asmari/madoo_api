const sequelize = require('sequelize');

const model = require('./conn/sequelize').sequelize;

const WebView = model.define('webview_content', {
	type: {
		type: sequelize.STRING,
		allowNull: false,
	},
	url: {
		type: sequelize.STRING,
		allowNull: false,
	},
}, {
	timestamps: true,
	paranoid: true,
	underscored: true,
	deletedAt: 'deleted_at',
	tableName: 'webview_content',
	freezeTableName: true,
});

exports.Get = WebView;
