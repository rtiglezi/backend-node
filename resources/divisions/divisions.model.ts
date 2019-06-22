import * as mongoose from 'mongoose'
import {User} from '../users/users.model'

export interface Division extends mongoose.Document {
    name: string
}


const divisionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export const Division = mongoose.model<Division>('Division', divisionSchema)