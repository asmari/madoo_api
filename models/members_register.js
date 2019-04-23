const Sequelize = require('sequelize');
const model = require('./conn/sequelize').sequelize;

const Otp = require('./otp_members');

const MembersRegister = model.define('members_register', {
	full_name: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Full name is required',
			},
			// isAlpha: true,
		},
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true,
		set(val) {
			this.setDataValue('email', val.toLowerCase());
		},
		validate: {
			isEmail: true,
		},
		unique: {
			args: true,
			msg: 'Email address already in use!',
		},
	},
	// country_code: {
	//     type: Sequelize.STRING,
	//     allowNull: false,
	//     validate: {
	//         notEmpty: {
	//             msg: "Country Code is required"
	//         },
	//         isNumeric: true,
	//     }
	// },
	mobile_phone: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Mobile Phone name is required',
			},
			isNumeric: true,
		},
		unique: {
			args: true,
			msg: 'Mobile phone already in use!',
		},
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				msg: 'Status name is required',
			},
		},
	},
	fb_id: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	fb_token: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
	g_id: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	g_token: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
}, {
	timestamps: true,
	freezeTableName: true,
	underscored: true,
	deletedAt: 'deleted_at',
	paranoid: true,
});

MembersRegister.hasOne(Otp.Get, { foreignKey: 'members_register_id' });

exports.Get = MembersRegister;
