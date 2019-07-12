import { User } from './../users/users.model';
import { Division } from './../divisions/divisions.model';
import * as mongoose from 'mongoose';


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
    name: string,
    stages: Stage[]
}

const resultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        unique: true
    },
    position: {
        type: Number,
        required: false,
        unique: true
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
    name: {
        type: String,
        required: true,
        unique: true
    },
    stages: {
        type: [stageSchema],
        required: false,
        select: false
    }
})

export const Request = mongoose.model<Request>('Request', requestSchema)