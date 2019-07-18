import * as mongoose from 'mongoose'
import { Tenant } from '../tenants/tenants.model';

export interface Division extends mongoose.Document {
    tenant: mongoose.Types.ObjectId | Tenant
    name: string
}


const divisionSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    name: {
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


const updateMiddleware = function (next) {

    let date = new Date();
    let timestamp = date.getTime();

    this.getUpdate().updated_at = timestamp;

    next()
}


/* middleware para criptografar a senha no momento de alterar */
divisionSchema.pre('findOneAndUpdate', updateMiddleware)
divisionSchema.pre('update', updateMiddleware)


export const Division = mongoose.model<Division>('Division', divisionSchema)