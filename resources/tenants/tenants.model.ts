import * as mongoose from 'mongoose'

export interface Tenant extends mongoose.Document {
    tenant_alias: string,
    tenant_name: string
}


const tenantSchema = new mongoose.Schema({
    tenant_alias: {
        type: String,
        required: true,
    },
    tenant_name: {
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
tenantSchema.pre('findOneAndUpdate', updateMiddleware)
tenantSchema.pre('update', updateMiddleware)


export const Tenant = mongoose.model<Tenant>('Tenant', tenantSchema)