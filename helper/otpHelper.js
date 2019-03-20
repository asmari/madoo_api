const Otp = require("../models").Otp.Get

exports.sendOtp = (condition) => {

    let values = {
        otp:createOtp(),
        expired:createExpireDate(2)
    }

    return Otp.findOne({
        where:condition,
    }).then((otp) => {

        if(otp != null){
            otp.update({
                ...values,
                ...condition
            })
        }else{
            Otp.create({
                ...values,
                ...condition
            })
        }

        /* 
            TODO SMS OTP GATEWAY 
            here later need to implement sms otp gateway connection
        */

        return otp
    })
    
}

exports.checkOtp = (otpNumber, condition) => {

    return Otp.findOne({
        where:condition
    })
    .then((otp) => {

        if(otp != null){
            if(otp.otp == otpNumber){
                return {
                    status:true,
                    message:"Ok"
                }
            }else{
                return {
                    status:false,
                    message:"Otp mismatch"
                }
            }
        }

        return {
            status:false,
            message:"Otp not found"
        }

    })
    .catch((err) => {
        return {
            status:false,
            message:err
        }
    })

}

const createOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const createExpireDate = (minutes) => {
    const d = new Date()
    return new Date(d.getTime() + minutes * 60000)
}

exports.createExpireDate = createExpireDate
exports.createOtpNumber = createOtp