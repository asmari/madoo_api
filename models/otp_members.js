
const Sequelize = require('sequelize');
const connet = require('./conn/sequelize');
const model = connet.sequelize;

const MembersRegister = require('./members_register');

const OtpMembers = model.define('otp_members', {
    members_register_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MembersRegister.Get,
            key: "id"
        }
    },
    otp: {
        type: Sequelize.INTEGER,
        validate: {
            notEmpty: {
                msg: "Otp is required"
            },
        }
    },
    expired: {
        type: Sequelize.INTEGER
    },
    type_message: {
        type: Sequelize.STRING
    },
}, {
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    deletedAt: 'deleted_at',
    paranoid: true
});

exports.Get = OtpMembers;