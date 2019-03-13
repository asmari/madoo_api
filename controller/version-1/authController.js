const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const Pins = model.Pins.Get;

//Index Auth member
exports.authIndex = async (request, reply) => {
    return reply.send({ status: true });
}

//Process login member
exports.doLogin = (request, reply) => {
    try {
        const params = request.body;

        Members.findOne({ where: {mobile_phone: params.mobile_phone, country_code: params.country_code}, include: [Pins] }).then(member => {
            let pin = member.pin_member;

        
            if (bcrypt.compareSync(params.pin, pin.pin)) {
                let payload = {
                    id: member.id,
                    full_name: member.full_name,
                    email: member.email,
                    country_code: member.country_code,
                    mobile_phone: member.mobile_phone,
                    image: member.image,
                    created_at: member.created_at,
                    updated_at: member.updated_at,
                };

                reply.jwtSign(payload, function (err, token) {
                    if (err) {
                        return reply.code(200).send(helper.Fail(err))
                    } else {
                        let res = {
                            token_type: 'Bearer',
                            access_token: token
                        };
                        return reply.code(200).send(helper.Success(res))
                    }
                })
            }else{
                reply.code(500).send(helper.Fail({
                    message:"Pin tidak cocok"
                }, 500))
            }
        });
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
}