const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;


const About = model.define('about', {
	description: {
		type: sequelize.STRING,
		allowNull: false,
	},
	google_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
	facebook_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
	instagram_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
	web_url: {
		type: sequelize.STRING,
		allowNull: true,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'about',
});
sequelizePaginate.paginate(About);
exports.Get = About;
