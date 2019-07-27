import * as restify from 'restify'
import { ModelRouter } from '../../common/model.router'

import { authorize } from '../../security/authz.handler';
import { Process } from './processes.model';

import { NotFoundError } from 'restify-errors'

import * as mongoose from 'mongoose'
import { Demand } from '../demands/demands.model';


class ProcessesRouter extends ModelRouter<Process> {

  constructor() {
    super(Process)
  }

  findAll = (req, resp, next) => {
    Process.aggregate([
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
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {$unwind: '$tenantDetails'},
      {$unwind: '$divisionDetails'},
      {$unwind: '$demandDetails'},
      {
        $project: {
          "updated_at": '$updated_at',
          "number": '$number',
          "tenant_id": '$tenantDetails._id',
          "tenant_name": '$tenantDetails.name',
          "division_id": '$divisionDetails._id',
          "division_name": '$divisionDetails.name',
          "demand_id": '$demandDetails._id',
          "demand_name": '$demandDetails.name',
          "requester_id": '$requester._id',
          "requester_name": '$requester.name',
          "city": '$city',
          "state": '$state',
          "stage_id" : '$stage',
          "array_stages": '$demandDetails.stages'
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
    Process.findOne(query)
      .then(obj => {
        resp.json(obj)
      })
      .catch(next)
  }


  save = (req, resp, next) => {
    // insere a identificação do inquilino no "body" da requisição
    req.body.tenant = req.authenticated.tenant


    Demand.findOne({ "_id": req.body.demand }, "+stages")
      .then(rqst => {
        if (!rqst) {
          throw new NotFoundError('Demand not found.')
        } else {
          


          // insere a primeira etapa da demanda... 
          req.body.stage = rqst.stages[0]._id
          // cria um novo documento com os atributos do body
          let document = new Process(req.body)
          // salva o documento no banco de dados
          document.save()
            .then(obj => resp.json(obj))
            .catch(next)




        }
      })



  }


  replace = (req, resp, next) => {
    let query = {
      "_id": req.params.id
    }
    Object.assign(query, { "tenant": req.authenticated.tenant })
    const options = { runValidators: true, overwrite: true }
    Process.update(query, req.body, options)
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
    Process.findOneAndUpdate({ $and: [query, queryAnd] }, req.body, options)
      .then(obj => resp.json(obj))
      .catch(next)
  }


  delete = (req, resp, next) => {
    let query = {
      "_id": req.params.id
    }
    Object.assign(query, { "tenant": req.authenticated.tenant })
    Process.remove(query)
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
    application.get(`${this.basePath}`, [authorize('admin', 'user'), this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.findById])
    application.post(`${this.basePath}`, [authorize('admin'), this.save])
    application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
    application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
    application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

  }
}

export const processesRouter = new ProcessesRouter()