import * as mongoose from 'mongoose'
import {User} from '../users/users.model'

export interface Unit extends mongoose.Document {
    name: string,
    allowedUser: [mongoose.Types.ObjectId | User]
}


const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    allowedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }]
})

export const Unit = mongoose.model<Unit>('Unit', unitSchema)