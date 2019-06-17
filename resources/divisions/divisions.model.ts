import * as mongoose from 'mongoose'
import {User} from '../users/users.model'

export interface Division extends mongoose.Document {
    name: string,
    allowedUser: [mongoose.Types.ObjectId | User]
}


const divisionSchema = new mongoose.Schema({
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

export const Division = mongoose.model<Division>('Division', divisionSchema)