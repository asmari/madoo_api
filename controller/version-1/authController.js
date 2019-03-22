const model = require('../../models');
const helper = require('../../helper');
const otpHelper = require("../../helper/otpHelper")
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
                return reply.send(helper.Success({
                    user_exist:true
                }))
            }else{
                return reply.send(helper.Success({
                    user_exist:false
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

        if(!params.hasOwnProperty("mobile_phone")){
            throw {
                message : "Field mobile_phone is required"
            }
        }

        if(!params.hasOwnProperty("country_code")){
            throw {
                message : "Field country_code is required"
            }
        }

        if(!params.hasOwnProperty("pin")){
            throw {
                message : "Field pin is required"
            }
        }

        Members.findOne({ where: {mobile_phone: params.mobile_phone, country_code: params.country_code}, include: [Pins] }).then(member => {
            
            if(member == null){
                return reply.send(helper.Fail({
                    message: "Member not found",
                    statusCode:404
                }))
            }
            
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
                    fingerprint: member.finggerprint
                };

                reply.jwtSign(payload, function (err, token) {
                    if (err) {
                        return reply.code(200).send(helper.Fail(err))
                    } else {
                        let res = {
                            token_type: 'Bearer',
                            access_token: token,
                            fingerprint: member.finggerprint
                        };
                        return reply.code(200).send(helper.Success(res))
                    }
                })
            }else{
                reply.code(500).send(helper.Fail({
                    message:"Pin member is not valid"
                }, 500))
            }
        });
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
}

// forgot pin otp
exports.setForgotPinOtp = async (request, reply) => {
    try{

        const params = request.body

        const member = await Members.findOne({
            where:{
                mobile_phone:params.mobile_phone
            }
        })


        if(member){

            const resOtp = await otpHelper.forgotPinOtp({
                members_id:member.id
            }, params.mobile_phone)

            reply.send(helper.Success(resOtp))

        }

        throw({
            message:"Member not found"
        })

    }catch(err){
        console.error(err)
        reply.send(helper.Fail(err))
    }
}

// check forgot pin otp
exports.checkForgotPinOtp = async (request, reply) => {
    try{

        const params = request.body

        const member = await Members.findOne({
            where:{
                mobile_phone:params.mobile_phone
            }
        })


        if(member){

            const resOtp = await otpHelper.forgotCheckOtp({
                members_id:member.id
            }, params.otp)

            reply.send(helper.Success(resOtp))

        }

        throw({
            message:"Member not found"
        })

    }catch(err){
        console.error(err)
        reply.send(helper.Fail(err))
    }
}


//change forgot pin 
exports.doChangePin = async (request, reply) => {
    try{

        const params = request.body

        if(params.pin != params.confirm_pin){
            return reply.send(helper.Fail({
                message:"Pin not same with confirm pin",
                statusCode:500
            }))
        }

        if(params.pin.toString().length > 6 || params.pin.toString().length < 6){
            return reply.send(helper.Fail({
                message:"Pin length must be 6",
                statusCode:500
            }))
        }

        const member = await Members.findOne({
            where:{
                mobile_phone:params.mobile_phone
            }
        })

        if(member){

            const pin = await Pins.findOne({
                where:{
                    members_id:member.id
                }
            })

            let newPin = null

            const pinHash = bcrypt.hashSync(params.pin.toString(), 10)

            if(pin == null){
                newPin = await Pins.create({
                    pin:pinHash,
                    members_id:member.id,
                    token:"",
                    expired:new Date(),
                    wrong:0
                })
            }else{
                pin.update({
                    pin:pinHash,
                    members_id:member.id
                })

                newPin = pin
            }

            const isOauth = member.fb_id != null || member.g_id != null ? true:false

            const payload = {
                id:member.id,
                oauth:isOauth
            }

            reply.jwtSign(payload, function (err, token) {
                if (err) {
                    return reply.code(200).send(helper.Fail(err))
                } else {
                    let res = {
                        token_type: 'Bearer',
                        access_token: token,
                        fingerprint: member.finggerprint
                    };
                    return reply.code(200).send(helper.Success(res))
                }
            })

        }else{
            throw({
                message:"Member not found",
                statusCode:404
            })
        }

        

    }catch(err){

        reply.send(helper.Fail(err))

    }
}