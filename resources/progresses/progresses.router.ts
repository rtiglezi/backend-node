import { ModelRouter } from '../../common/model.router'
import * as restify from 'restify'
import { Progress } from './progresses.model'

import { authorize } from '../../security/authz.handler';

import { NotFoundError } from 'restify-errors'


class ProgressesRouter extends ModelRouter<Progress> {

    constructor() {
        super(Progress)
    }


    findBySpecificTenant = (req, resp, next) => {
        let query = {
            "tenant": req.query.tenant
        }
        if (req.query.tenant) {
            Progress.find(query)
                .then(progress => {
                    progress ? [progress] : []
                    resp.json(progress)
                })
                .catch(next)
        } else {
            next()
        }
    }


    findAll = (req, resp, next) => {
      Progress.aggregate([
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
            from: "demands",
            localField: "demand",
            foreignField: "_id",
            as: "demandDetails"
          }
        },
        {
          $lookup:
          {
            from: "divisions",
            localField: "division",
            foreignField: "_id",
            as: "divisionDetails"
          }
        },
        {
          $lookup:
          {
            from: "processes",
            localField: "process",
            foreignField: "_id",
            as: "processDetails"
          }
        },
        {
          $lookup:
          {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: '$tenantDetails' },
        { $unwind: '$divisionDetails' },
        { $unwind: '$demandDetails' },
        { $unwind: '$processDetails' },
        { $unwind: '$userDetails' },
        {
          $project: {
            "updated_at": '$updated_at',
            "proccessId": '$proccessDetails._id',
            "proccessNumber": '$proccessDetails.number',
            "tenantId": '$tenantDetails._id',
            "tenantName": '$tenantDetails.name',
            "demandId": '$demandDetails._id',
            "demandName": '$demandDetails.name',
            "divisionId": '$divisionDetails._id',
            "divisionName": '$divisionDetails.name',
            "userId": '$userDetails._id',
            "userName": '$userDetails.name',
            "occurrence": '$occurrence',
            "stage": '$stage',
            "stageId": '$stage',
            "arrayStages": '$demandDetails.stages'
          }
        }
      ])
        .sort({ number: 1 })
        .then(processes => {
          resp.json(processes)
        }).catch(next)
    }


    findById = (req, resp, next) => {
        let query = {
            "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
        Progress.findOne(query)
            .then(obj => {
                resp.json(obj)
            })
            .catch(next)
    }


    save = (req, resp, next) => {
        // insere a identificação do inquilino no "body" da requisição
        req.body.tenant = req.authenticated.tenant
        // cria um novo documento com os atributos do body
        let document = new Progress(req.body)
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
        Progress.update(query, req.body, options)
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
        Progress.findOneAndUpdate({ $and: [query, queryAnd] }, req.body, options)
          .then(obj => resp.json(obj))
          .catch(next)
      }
    
    
      delete = (req, resp, next) => {
        let query = {
          "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
        Progress.remove(query)
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



    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, [authorize('user'), this.findBySpecificTenant, this.findAll])
        application.get(`${this.basePath}/:id`, [authorize('user'), this.validateId, this.findById])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])
    }
}

export const progressesRouter = new ProgressesRouter()