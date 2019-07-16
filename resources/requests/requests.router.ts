import { NotFoundError } from 'restify-errors';
import { ModelService } from '../../common/model.service'
import * as restify from 'restify'
import { Request } from './requests.model'

import { authorize } from '../../security/authz.handler';


class RequestsRouter extends ModelService<Request> {

    constructor() {
        super(Request)
    }

    findAll = (req, resp, next) => {
        Request.aggregate([
            {
                $match: {
                    tenant_id: req.authenticated.tenant_id
                }
            },
            {
                $lookup:
                {
                    from: "divisions",
                    localField: "allowedDivisions",
                    foreignField: "_id",
                    as: "allowedDivisionsDetails"
                }
            },
            {
                $project: {
                    password: 0
                }
            }
        ])
            .sort({ name: 1 })
            .then(requests => {
                resp.json(requests)
            }).catch(next)
    }


    findStages = (req, resp, next) => {
        Request.findById(req.params.id, "+stages")
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Request not found.')
                } else {
                    resp.json(rqst.stages)
                    return next()
                }
            }).catch(next)
    }

    replaceStages = (req, resp, next) => {
        Request.findById(req.params.id)
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Request not found.')
                } else {
                    rqst.stages = req.body //ARRAY de estágios
                    return rqst.save()
                }
            }).then(rqst => {
                resp.json(rqst.stages)
                return next()
            }).catch(next)
    }



    findResults = (req, resp, next) => {
        Request.findById(req.params.id, "+stages")
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Request not found.')
                } else {
                    rqst.stages.map(r => {
                        resp.json(r.results)
                    })
                }
            }).catch(next)
    }

    replaceResults = (req, resp, next) => {
        Request.findById(req.params.id, "+stages")
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Request not found.')
                } else {
                    rqst.stages.map(r => {

                        if (r._id === req.params.stId) {

                            r.results = req.body //ARRAY de estágios
                            return r.save()

                        }

                    })
                }
            }).catch(next)
    }


    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, [authorize('admin', 'user'), this.findAll])
        application.get(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.findById])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

        application.get(`${this.basePath}/:id/stages`, [authorize('admin', 'user'), this.validateId, this.findStages])
        application.put(`${this.basePath}/:id/stages`, [authorize('admin'), this.validateId, this.replaceStages])

        application.get(`${this.basePath}/:id/stages/:stId/results`, [authorize('admin', 'user'), this.validateId, this.findResults])
        application.put(`${this.basePath}/:id/stages/:stId/results`, [authorize('admin'), this.validateId, this.replaceResults])

    }
}

export const requestsRouter = new RequestsRouter()