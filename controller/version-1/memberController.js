const model = require('../../models');
const helper = require('../../helper');
const otpHelper = require('../../helper/otpHelper');
const moment = require("moment")
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const Otp = model.Otp.Get;

//Index Auth member
exports.memberIndex = async (request, reply) => {
    MembersRegister.all({include: [Otp]}).then(memberRegister=>{
        return reply.code(200).send(helper.Success(memberRegister))
    });

}

//process to memberRegister with phone
exports.doRegisterPhone = async (request, reply) => {
    try {
        const params = request.body;

        const memberRegister = await MembersRegister.findOne({ where: {mobile_phone: params.mobile_phone}},{})
        if(memberRegister){
            if (memberRegister.status!="regitered"){
                const sendOtp = await otpHelper.sendOtp({members_register_id:memberRegister.id},memberRegister.mobile_phone)
                reply.send(helper.Success(sendOtp))
            }else {
                throw({
                    message: "Member already registered! Please login"
                })
            }

        }else{
            let payload = {
                full_name: params.full_name,
                email: params.email,
                mobile_phone: params.mobile_phone,
                status: "pending",
            };
            const newMember = await MembersRegister.create(payload)
            const sendOtp = await otpHelper.sendOtp({members_register_id:newMember.id},newMember.mobile_phone)
            return reply.code(200).send(helper.Success(sendOtp))
        }
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }

};

exports.doOtpValidation= async (request, reply) => {
    try{
        const params = request.body;

        const memberRegister = await  MembersRegister.findOne({include: [Otp] ,where: {mobile_phone: params.mobile_phone, status: "pending"}})

        if(memberRegister){
            const otpCheck = await otpHelper.checkOtp({members_register_id: memberRegister.id},params.otp)
            reply.code(200).send(helper.Success(otpCheck))
        }else{

            throw({
                message: "Member not found"
            })
        }

    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
};
exports.doSaveMember= async (request, reply) => {
    try{
        const params = request.body;

        const expired =moment().add(1,'month').format('YYYY-MM-DD HH:mm:ss');
        params.pin = bcrypt.hashSync(params.pin.toString(), 10);


        const memberRegister = await MembersRegister.findOne({where:{mobile_phone: params.mobile_phone, status: "pending"}})
        if (memberRegister) {
            const member =await Members.create(params)
            const pin = await Pins.create({pin:params.pin,members_id:member.id,expired:expired})
            await memberRegister.update({status: "registered"})
            let payload = {
                id: member.id,
                oauth:false
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
                    pin.update({token:token});
                    return reply.code(200).send(helper.Success(res))
                }
            })
        } else {

            throw({
                message: "Member not found"
            })
        }

    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
};
