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
        unique: "test"
    },
    country_code: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {}
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
            message: 'Mobile phone already in use!'
        }
    },
    finggerprint: {
        type:Sequelize.INTEGER,
        allowNull:true,
        validate:{
            notEmpty: {
                msg: "Fingerprint is required"
            },
            isNumeric: true
        }
    },
    image: {
        type: Sequelize.STRING
    },
    g_id:{
        type:Sequelize.STRING,
        allowNull: true
    },
    g_token:{
        type:Sequelize.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    deletedAt: 'deleted_at',
    paranoid: true
});

Members.hasOne(Pins.Get, {foreignKey: 'member_id'})

exports.Get = Members;