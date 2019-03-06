const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const Pins = model.Pins.Get;

async function routes(fastify, options) {
    // get members
    fastify.get('/', async (request, reply) => {
        request.jwtVerify(function (err, decoded) {
            if (err) {
                return reply.code(200).send(helper.Fail(err))
            } else {
                return reply.code(200).send(helper.Success(decoded))
            }
        })
    })

    // register members
    fastify.post('/register', async (request, reply) => {
        try {
            let params = request.body;
            const hash = bcrypt.hashSync(params.pin, 10);

            return sequelize.transaction(function (t) {
                return Promise.all([ 
                    Members.create({
                        full_name: params.full_name,
                        email: params.email,
                        country_code: params.country_code,
                        mobile_phone: params.mobile_phone,
                        image: '/path'
                    })
                ]).then(([members]) => Pins.create({member_id: members.id, pin: hash}, { transaction: t }).then(pins => {
                    return Members.findByPk(pins.member_id);
                }));
            }).then(async function (member) {
                return reply.code(200).send(helper.Success(member))
            }).catch(function (err) {
                return reply.code(200).send(helper.Fail(err))
            });
        } catch (err) {
            return reply.code(200).send(helper.Fail(err))
        }
    })
}

module.exports = routes