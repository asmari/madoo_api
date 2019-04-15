const sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const model = require('./conn/sequelize').sequelize;


const Contact = model.define('contact', {
	title: {
		type: sequelize.STRING,
		allowNull: true,
	},
	body: {
		type: sequelize.STRING,
		allowNull: true,
	},
	email: {
		type: sequelize.STRING,
		allowNull: false,
		unique: true,
	},
	phone: {
		type: sequelize.STRING,
		allowNull: false,
	},
	open_contact: {
		type: sequelize.STRING,
		allowNull: true,
	},
}, {
	timestamps: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
	freezeTableName: true,
	tableName: 'contact',
});
sequelizePaginate.paginate(Contact);
exports.Get = Contact;
