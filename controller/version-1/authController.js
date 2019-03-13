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

//Procss check member if exists by phone number and country code
exports.doCheckMember = (request, reply) => {
    try{

        const params = request.body;

        if(!params.hasOwnProperty("mobile_phone")){
            throw {
                message: "Field mobile_phone is required"
            }
        }

        if(!params.hasOwnProperty("country_code")){
            throw {
                message: "Field country_code is required"
            }
        }

        Members.findOne({ where : {mobile_phone: params.mobile_phone, country_code: params.country_code}}).then(member => {

            if(member != null){
                return reply.send(helper.Success(params, "Member exist"))
            }else{
                return reply.send(helper.Fail({
                    message:"Member not exist",
                    statusCode:404
                }))
            }
            

        })
        .catch((err) => {
            throw err;
        })

    }catch(err){
        return reply.code(500).send(helper.Fail(err, 500))
    }
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