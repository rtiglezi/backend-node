import * as mongoose from 'mongoose'

export interface Result extends mongoose.Document {
    name: string,
    position: number,
    entailsConclusion: boolean
}

export interface Stage extends mongoose.Document {
    name: string,
    position: number,
    requiresAnalysis: boolean,
    results: Result[]
}

export interface Request extends mongoose.Document {
    name: string,
    stages: Stage[]
}

const resultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    position: {
        type: Number,
        unique: true
    },
    entailsConclusion: {
        type: Boolean
    }
})

const stageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    position: {
        type: Number,
        unique: true
    },
    requiresAnalysis: {
        type: Boolean
    },
    results: {
        type: [resultSchema],
        required: false
    } 
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