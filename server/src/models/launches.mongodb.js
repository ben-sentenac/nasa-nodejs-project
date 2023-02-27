const mongoose = require ('mongoose');

const launchesSchema = mongoose.Schema({
    flightNumber:{
        type:Number,
        required:true
    },
    mission:{
        type:String,
        required:true
    },
    rocket:{
        type:String,
        required:true
    },
    launchDate:{
        type:Date,
        required:true
    },
    target:{
        type:String,
    },
    customers:[ String ],
    upcoming:{
        type:Boolean,
        required:true
    },
    success:{
        type:Boolean,
        required:true,
        default:true
    }
});

//Connect launchesSchema with "launches" collection

// mogoose set Launch to lowercase and plurial
module.exports = mongoose.model('Launch',launchesSchema);