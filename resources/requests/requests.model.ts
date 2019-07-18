import { User } from './../users/users.model';
import { Division } from './../divisions/divisions.model';
import * as mongoose from 'mongoose';
import { Tenant } from '../tenants/tenants.model';


export interface Result extends mongoose.Document {
    name: string,
    position: number,
    entailsConclusion: boolean
}

export interface Stage extends mongoose.Document {
    name: string,
    position: number,
    results: Result[],
    allowedDivisions: [mongoose.Types.ObjectId | Division],
    allowedUsers: [mongoose.Types.ObjectId | User]
}

export interface Request extends mongoose.Document {
    tenant: mongoose.Types.ObjectId | Tenant
    name: string,
    stages: Stage[]
}

const resultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    position: {
        type: Number,
        required: false,
    },
    entailsConclusion: {
        type: Boolean
    }
})

const stageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: Number
    },
    results: {
        type: [resultSchema],
        required: false
    },
    allowedDivisions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Division',
        required: false
    }],
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }]
})

const requestSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    stages: {
        type: [stageSchema],
        required: false,
        select: false
    }
})

export const Request = mongoose.model<Request>('Request', requestSchema)