"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const validators_1 = require("../common/validators");
const bcrypt = require("bcrypt");
const environment_1 = require("./../common/environment");
/* schema server para informar ao mongoose
   quais são os metadados do documento */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    login: {
        type: String,
        unique: true,
        required: true,
        maxlength: 30,
        minlength: 10
    },
    password: {
        type: String,
        select: false,
        required: true,
        minlength: 8
    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female']
    },
    cpf: {
        type: String,
        required: false,
        validate: {
            validator: validators_1.validateCPF,
            message: '{PATH}: Invalid CPF ({VALUE})'
        }
    },
    allowedUnit: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Unit',
            required: false
        }],
    profiles: {
        type: [String],
        required: false
    }
});
userSchema.statics.findByEmail = function (email, projection) {
    return this.findOne({ email }, projection); //{email: email}
};
userSchema.methods.matches = function (password) {
    return bcrypt.compareSync(password, this.password);
};
userSchema.methods.hasAny = function (...profiles) {
    return profiles.some(profile => this.profiles.indexOf(profile) !== -1);
};
/* função para aproveitar código nas duas middlewares abaixo */
const hasPassword = (obj, next) => {
    bcrypt.hash(obj.password, environment_1.environment.security.saltRounds)
        .then(hash => {
        obj.password = hash;
        next();
    }).catch(next);
};
const saveMiddleware = function (next) {
    const user = this;
    console.log(user);
    if (!user.isModified('password')) {
        next();
    }
    else {
        hasPassword(user, next);
    }
};
const updateMiddleware = function (next) {
    if (!this.getUpdate().password) {
        next();
    }
    else {
        hasPassword(this.getUpdate(), next);
    }
};
/* middleware para criptografar a senha no momento de inserir */
userSchema.pre('save', saveMiddleware);
/* middleware para criptografar a senha no momento de alterar */
userSchema.pre('findOneAndUpdate', updateMiddleware);
userSchema.pre('update', updateMiddleware);
/* model serve para manipular o documento */
exports.User = mongoose.model('User', userSchema);
