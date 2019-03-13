
const Sequelize = require('sequelize');
const connet = require('./conn/sequelize');
const model = connet.sequelize;

const Members = require('./members');

const PinMembers = model.define('pin_members', {
    member_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Members.Get,
            key: "id"
        }
    },
    members_id: {
        type: Sequelize.INTEGER
    },
    pin: {
        type: Sequelize.INTEGER,
        validate: {
            notEmpty: {
                msg: "Pin is required"
            },
        }
    },
    token: {
        type: Sequelize.STRING
    },
    expired: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: true,
    underscored: true,
    deletedAt: 'deleted_at',
    paranoid: true
});

exports.Get = PinMembers;