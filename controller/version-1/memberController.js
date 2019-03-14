const model = require('../../models');
const helper = require('../../helper');
const bcrypt = require('bcrypt');

const conn = require('../../models/conn/sequelize');
const sequelize = conn.sequelize;

const Members = model.Members.Get;
const MembersRegister = model.MembersRegister.Get;
const Pins = model.Pins.Get;
const Otp = model.Otp.Get;

//Index Auth member
exports.memberIndex = async (request, reply) => {
    MembersRegister.all({include: [Otp]}).then(members_register=>{
        return reply.code(200).send(helper.Success(members_register))
    });

}

//process to member_register
exports.registerMember = (request, reply) => {
    try {
        const params = request.body;

        MembersRegister.findOne({ where: {mobile_phone: params.mobile_phone, country_code: params.country_code}}).then(members_register => {
            if (!members_register) {
                let payload = {
                    full_name: params.full_name,
                    email: params.email,
                    country_code: params.country_code,
                    mobile_phone: params.mobile_phone,
                };
                MembersRegister.create(payload).then(registered=>{

                    const date =new Date();
                    date.setHours(date.getHours()+24);
                    Otp.create({members_register_id:registered.id,otp: Math.floor(100000 + Math.random() * 900000),expired:date.getTime(),type_message:'test'}).then(new_otp=>{
                        return reply.code(200).send(helper.Success(registered))
                    }).catch(err=>{
                        reply.code(500).send(helper.Fail(err));
                    });
                }).catch(err=>{
                    reply.code(500).send(helper.Fail(err));
                });
            }else{
                reply.code(500).send(helper.Fail({
                    message:"Member already registered! Please login"
                }, 500))
            }
        });
    } catch (err) {
        return reply.code(200).send(helper.Fail(err))
    }
}