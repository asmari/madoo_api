const model = require('../../models');
const otpHelper = require("../../helper/otpHelper");
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;

//register fb oauth
exports.doRegisterFacebook = async (request, reply) => {

    try{

        let params = request.raw.body || request.body

        params = params || {}

        if(!params.hasOwnProperty("full_name")){
            return reply.send(helper.Fail({
                message:"Field full_name is required"
            }))
        }

        if(!params.hasOwnProperty("email")){
            return reply.send(helper.Fail({
                message:"Field email is required"
            }))
        }

        if(!params.hasOwnProperty("mobile_phone")){
            return reply.send(helper.Fail({
                message:"Field mobile_phone is required"
            }))
        }

        if(!params.hasOwnProperty("fb_id")){
            return reply.send(helper.Fail({
                message:"Field fb_id is required"
            }))
        }

        if(!params.hasOwnProperty("fb_token")){
            return reply.send(helper.Fail({
                message:"Field fb_token is required"
            }))
        }

        if(!params.hasOwnProperty("pin")){
            return reply.send(helper.Fail({
                message:"Field pin is required"
            }))
        }


        let fingerprint = params.hasOwnProperty("fingerprint") ? params.fingerprint:0
        let image = params.hasOwnProperty("image") ? params.image: null

        // start transaction
        sequelize.transaction( async (t) => {
            
            //find email unique
            return Members.findOne({
                where:{
                    email:params.email
                }
            }).then((member) => {
                if(member != null){
                    return Promise.reject({
                        message:"Email already registered"
                    })
                }

                //find phone unique
                return Members.findOne({
                    where:{
                        mobile_phone:params.mobile_phone
                    }
                })
            }).then( async (member) => {


                if(member != null){
                    return Promise.reject({
                        message:"Phone number already registered"
                    })
                }

                //create member
                const exists = await MembersRegister
                .findOne({
                    where:
                    {
                        mobile_phone: params.mobile_phone, 
                        status: "pending"
                    }
                })

                if(exists != null){
                    return exists
                }else{

                    return MembersRegister.create({
                        full_name:params.full_name,
                        email: params.email,
                        fb_id: params.fb_id,
                        fb_token : params.fb_token,
                        mobile_phone:params.mobile_phone,
                        pin:params.pin,
                        finggerprint:fingerprint,
                        image:image,
                        status:"pending"
                    })
                }
            })
            .then((members) => {

                return otpHelper.sendOtp({
                    members_register_id:members.id
                }, params.mobile_phone)
                .then((otp) => {

                    return members

                })

            //     //create pin for member
            //     return Pins.create({
            //         members_id: members.id,
            //         token:0,
            //         expired:new Date(),
            //         wrong:0,
            //         pin: hash}, { transaction: t }).then(pins => {
            //             return Members.findByPk(pins.member_id);
            //         })
            })

            
        }).then(async (member) =>{

            let payload = params
            payload.image = image
            payload.fingerprint = fingerprint
            
            reply.send(helper.Success(payload))

        }).catch((err) => {
            reply.code(500).send(helper.Fail(err))
        })
        

    }catch(err){
        reply.code(500).send(helper.Fail(err))
    }


}

// check otp facebook oauth
exports.doCheckOtp = async (request, reply) => {

    try{

        const body = request.body

        const member = await MembersRegister.findOne({
            where:{
                mobile_phone:body.mobile_phone,
                email:body.email,
                fb_id:body.fb_id
            }
        })

        if(member != null){

            const { status, message } = await otpHelper.checkOtp(body.otp, {
                members_register_id:member.id
            })
            
            if(status){
                reply.send(helper.Success({
                    otp_status: status
                }, message))
            }else{
                reply.send(helper.Fail({
                    message:message
                }))
            }

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

//do save member with facebook
exports.doSaveMember = async (request, reply) => {

    try{

        const params = request.body
        const date = new Date()

        const pin = bcrypt.hashSync(params.pin.toString(), 10)

        const memberRegister = await MembersRegister.findOne({
            where:{
                email:params.email,
                mobile_phone:params.mobile_phone,
                status:"pending"
            }
        })

        if(memberRegister != null){

            const member = await Members.create({
                ...params,
                fb_id:memberRegister.fb_id,
                fb_token:memberRegister.fb_token
            })

            await Pins.create({
                pin,
                members_id:member.id,
                expired:date
            })

            await memberRegister.update({
                status:"registered"
            })

            let payload = {
                id:member.id,
                oauth:true
            }

            console.log(payload)

            let token = await new Promise((resolve, reject) => {
                reply.jwtSign(payload, (err, token) => {

                  if(err){
                      reject(err)
                  }else{
                      resolve(token)
                  }

                })
            })

            if(token != null){

                return reply.send(helper.Success({
                    token_type: "Bearer",
                    access_token:token,
                    fingerprint: member.finggerprint || 0
                }))

            }else{
                throw({
                    message:"Token is null",
                    statusCode:5000
                })
            }


        }

        throw({
            message:"Member register not found",
            statusCode:404
        })

    }catch(err){
        reply.send(helper.Fail(err))
    }

}

// login check against facebook oauth
exports.doLoginFacebook = (request, reply) => {

    try{

        let params = request.body

        if(!params.hasOwnProperty("email")){
            throw {
                message: "Field email is required",
                statusCode:400
            }
        }

        if(!params.hasOwnProperty("fb_id")){
            throw{
                message: "Field fb_id is required",
                statusCode:400
            }
        }

        if(!params.hasOwnProperty("fb_token")){
            throw{
                message: "Field fb_token is required",
                statusCode:400
            }
        }

        Members.findOne({
            where:{
                email:params.email,
                fb_id:params.fb_id
            }
        }).then((member) => {

            if(member == null){
                return reply.code(200).send(helper.Fail({
                    message:"Member is not found",
                    statusCode:404
                }))
            }

            //update fb_token using latest token received
            return member.update({
                fb_token:params.fb_token
            }).then(() => {

                let payload = {
                    id: member.id,
                    oauth:true
                };
    
                reply.jwtSign(payload, (err, token) => {
                    if(err){
                        return reply.send(helper.Fail(err))
                    }else{
                        let res = {
                            token_type:"Bearer",
                            access_token:token,
                            fingerprint:member.finggerprint
                        }
    
                        return reply.send(helper.Success(res))
                    }
                })
            })
        }).catch((err) => {
            return reply.code(500).send(helper.Fail(err))
        })


    }catch(err){
        return reply.code(500).send(helper.Fail(err))
    }

}