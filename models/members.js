const Sequelize = require('sequelize');
const connet = require('./conn/sequelize');
const model = connet.sequelize;

const Pins = require('./pin_members');

const Members = model.define('members', {
    full_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Full name is required"
            },
            // isAlpha: true,
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        set(val) {
            this.setDataValue('email', val.toLowerCase());
        },
        validate: {
            notEmpty: {
                msg: "Email is required"
            },
            isEmail: true,
        },
        unique: {
            args: true,
            msg: 'Email address already in use!'
        }
    },
    country_code: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Country Code is required"
            },
            isNumeric: true,
        }
    },
    mobile_phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Mobile Phone name is required"
            },
            isNumeric: true,
        },
        unique: {
            args: true,
            msg: 'Mobile phone already in use!'
        }
    },
    image: {
        type: Sequelize.STRING
    }
}, {
    timestamps: true,
    underscored: true,
    deletedAt: 'deleted_at',
    paranoid: true
});

Members.hasOne(Pins.Get, {foreignKey: 'member_id'})

exports.Get = Members;