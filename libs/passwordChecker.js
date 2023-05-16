function checkPasswordStrength(password) {
    let strengthScore = 0;
    let tips = [];

    if(password.length < 8)
        tips += {msg: "password must be 8 characters long"}
    else
        strengthScore++;

    if(password.match(/[a-z]/) && password.match(/[A-Z]/))
        strengthScore++;
    else
        tips += {msg: "Use both lowercase and uppercase letters. " }
    
    if(password.match(/\d/))
        strengthScore++;
    else
        tips += {msg: "Use atleast one number " }
    
    if(password.match(/[^a-zA-Z\d]/))
        strengthScore++;
    else
        tips += {msg:"Include atleast one special character"}

    console.log(tips);

    if(tips.length > 0)
        return false
    return true
}

module.exports = {
    checkPasswordStrength
}