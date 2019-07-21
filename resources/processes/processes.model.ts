import * as mongoose from 'mongoose';

import { Tenant } from '../tenants/tenants.model';
import { Demand } from '../demands/demands.model';
import { Division } from '../divisions/divisions.model';
import { User } from '../users/users.model';

import { validateCPF } from '../../common/validators'


export interface Requester extends mongoose.Document {
    person: string,
    document: string,
    name: string,
    tradingName: string,
    addressPublicArea: string,
    addressNumber: string,
    addressComplement: string,
    addressNeighborhood: string,
    addressZipCode: string,
    addressCity: string,
    addressState: string,
    email: string
}

export interface Process extends mongoose.Document {
    tenant: mongoose.Types.ObjectId | Tenant
    demand: mongoose.Types.ObjectId | Demand
    division: mongoose.Types.ObjectId | Division
    user: mongoose.Types.ObjectId | User
    requester: mongoose.Types.ObjectId | Requester,
    number: string
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
    },
    addressPublicArea: {
        type: String,
        required: false
    },
    addressNumber: {
        type: String,
        required: false
    },
    addressComplement: {
        type: String,
        required: false
    },
    addressNeighborhood: {
        type: String,
        required: false
    },
    addressZipCode: {
        type: String,
        required: false
    },
    addressCity: {
        type: String,
        required: false
    },
    addressState: {
        type: String,
        required: false
    },
    email: {
        type: String,
        match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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
    }
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    })

export const Process = mongoose.model<Process>('Process', processSchema)