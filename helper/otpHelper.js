
const Otp = require("../models").Otp.Get
const WaveCellSender = require("../helper/WaveCellSender")

exports.sendOtp = (condition, phoneNumber = null) => {

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

        if(phoneNumber != null){

            const waveSender = new WaveCellSender()
            
            waveSender.send(phoneNumber, "Kode OTP " + values.otp)
            .then((response) => {

                console.log(response)

            })
            .catch((err) => {
                console.error(err)
            })
        }

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
                
                const date1 = otp.expired
                const date2 = new Date()

                if(date1.getTime() > date2.getTime()){
                    return {
                        status:true,
                        message:"Ok"
                    }
                }else{
                    return {
                        status:false,
                        message:"Otp Expired"
                    }
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