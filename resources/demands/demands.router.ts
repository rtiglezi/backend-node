import { NotFoundError } from 'restify-errors';
import { ModelRouter } from '../../common/model.router'
import * as restify from 'restify'
import { Demand } from './demands.model'

import { authorize } from '../../security/authz.handler';


class DemandsRouter extends ModelRouter<Demand> {

    constructor() {
        super(Demand)
    }

    findAll = (req, resp, next) => {
        Demand.aggregate([
            {
                $match: {
                    tenant: req.authenticated.tenant
                }
            },
            {
                $lookup:
                {
                    from: "tenants",
                    localField: "tenant",
                    foreignField: "_id",
                    as: "tenantDetails"
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
            }
        ])
            .sort({ name: 1 })
            .then(demands => {
                resp.json(demands)
            }).catch(next)
    }

    findById = (req, resp, next) => {
        let query = {
            "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
        Demand.findOne(query)
            .then(obj => {
                resp.json(obj)
            })
            .catch(next)
    }


    save = (req, resp, next) => {
        // insere a identificação do inquilino no "body" da requisição
        req.body.tenant = req.authenticated.tenant
        // cria um novo documento com os atributos do body
        let document = new Demand(req.body)
        // salva o documento no banco de dados
        document.save()
            .then(obj => resp.json(obj))
            .catch(next)
    }

    replace = (req, resp, next) => {
        let query = {
          "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
        const options = { runValidators: true, overwrite: true }
        Demand.update(query, req.body, options)
          .exec().then(result => {
            if (result.n) {
              return this.model.findById(req.params.id).exec()
            } else {
              throw new NotFoundError('Document not found.')
            }
          }).then(obj => resp.json(obj))
          .catch(next)
      }
    
    
    
      update = (req, resp, next) => {
        let query = {
          "_id": req.params.id
        }
        let queryAnd = {}
        Object.assign(query, { "tenant": req.authenticated.tenant })
        const options = { runValidators: true, new: true }
        Demand.findOneAndUpdate({ $and: [query, queryAnd] }, req.body, options)
          .then(obj => resp.json(obj))
          .catch(next)
      }
    
    
      delete = (req, resp, next) => {
        let query = {
          "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
        Demand.remove(query)
          .exec()
          .then((cmdResult: any) => {
            if (cmdResult.result.n) {
              resp.send(204)
            } else {
              throw new NotFoundError('Document not found.')
            }
            return next()
          }).catch(next)
      }



    findStages = (req, resp, next) => {
        let query = {
            "_id": req.params.id,
            "tenant": req.authenticated.tenant 
        }
        Demand.findOne(query, "+stages")
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Demand not found.')
                } else {
                    resp.json(rqst.stages)
                    return next()
                }
            }).catch(next)
    }

    replaceStages = (req, resp, next) => {
        let query = {
            "_id": req.params.id,
            "tenant": req.authenticated.tenant 
        }
        Demand.findOne(query)
            .then(rqst => {
                if (!rqst) {
                    throw new NotFoundError('Demand not found.')
                } else {
                    rqst.stages = req.body //ARRAY de estágios
                    return rqst.save()
                }
            }).then(rqst => {
                resp.json(rqst.stages)
                return next()
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

    }
}

export const demandsRouter = new DemandsRouter()