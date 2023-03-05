const mongoose = require("mongoose");

const devuser = new mongoose.Schema({
    fullname:{
        type: String,
        reuired:true,
    },
    email:{
        type: String,
        require: true,
    },
    mobile:{
        type:String,
        require:true,
    },
    skilss:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required:true,
    },
    confirmPassword:{
        type: String,
        required:true
    }

})

module.exports = mongoose.model('devuser', devuser)