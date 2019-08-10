import * as mongoose from 'mongoose'
import { Tenant } from '../tenants/tenants.model';
import { Process } from '../processes/processes.model';
import { User } from '../users/users.model';
import { Division } from '../divisions/divisions.model';
import { Demand } from '../demands/demands.model';

export interface Automatic extends mongoose.Document {
    tenant: mongoose.Types.ObjectId | Tenant
    division: mongoose.Types.ObjectId | Division
    demand: mongoose.Types.ObjectId | Demand
    process: mongoose.Types.ObjectId | Process
    user: mongoose.Types.ObjectId | User
    stage: string
    occurrence: string
    systemGenerated: boolean
}


const automaticSchema = new mongoose.Schema({
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
        ref: 'Division',
        required: true
    },
    process: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Process',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stage: {
        type: String,
        required: true,
    },
    occurrence: {
        type: String,
        required: true,
    },
    systemGenerated: {
        type: Boolean,
        required: true,
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

    next()
}


/* middleware para criptografar a senha no momento de alterar */
automaticSchema.pre('findOneAndUpdate', updateMiddleware)
automaticSchema.pre('update', updateMiddleware)


export const Automatic = mongoose.model<Automatic>('Automatic', automaticSchema)