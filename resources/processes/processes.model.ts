import * as mongoose from 'mongoose';

import { Tenant } from '../tenants/tenants.model';
import { Demand } from '../demands/demands.model';
import { Division } from '../divisions/divisions.model';
import { User } from '../users/users.model';


export interface Requester extends mongoose.Document {
    person: string
    document: string
    name: string
    tradingName: string
}

export interface Process extends mongoose.Document {
    tenant: mongoose.Types.ObjectId | Tenant
    demand: mongoose.Types.ObjectId | Demand
    division: mongoose.Types.ObjectId | Division
    user: mongoose.Types.ObjectId | User
    requester: mongoose.Types.ObjectId | Requester
    number: string
    city: string
    state: string
    submitted: boolean
}


const requesterSchema = new mongoose.Schema({
    person: {
        type: String,
        required: true,
        enum: ['PJ', 'PF']
    },
    document: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    tradingName: {
        type: String,
        maxlength: 30,
        minlength: 3
    }
})


const processSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    demand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Demand',
        required: true
    },
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Division'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requester: {
        type: requesterSchema,
        required: true
    },
    number: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    submitted: {
        type: Boolean
    }
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    })

     
    const updateMiddleware = function (next) {
    
        let date = new Date();
        let timestamp = date.getTime();
    
        this.getUpdate().updated_at = timestamp;

        next();
    }
    
    
    /* middleware para criptografar a senha no momento de alterar */
    processSchema.pre('findOneAndUpdate', updateMiddleware)
    processSchema.pre('update', updateMiddleware)
    


export const Process = mongoose.model<Process>('Process', processSchema)