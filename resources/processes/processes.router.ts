import * as restify from 'restify'
import { ModelRouter } from '../../common/model.router'

import { authorize } from '../../security/authz.handler';
import { Process } from './processes.model';

import { NotFoundError } from 'restify-errors'

import { Demand } from '../demands/demands.model';
import { Progress } from '../progresses/progresses.model';

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
          from: "progresses",
          localField: "_id",
          foreignField: "process",
          as: "progressDetails"
        }
      },
      { $unwind: '$tenantDetails' },
      { $unwind: '$divisionDetails' },
      { $unwind: '$demandDetails' },
      {
        $project: {
          "updated_at": '$updated_at',
          "number": '$number',
          "tenantId": '$tenantDetails._id',
          "tenantName": '$tenantDetails.name',
          "divisionId": '$divisionDetails._id',
          "divisionName": '$divisionDetails.name',
          "demandId": '$demandDetails._id',
          "demandName": '$demandDetails.name',
          "requesterId": '$requester._id',
          "requesterName": '$requester.name',
          "requesterPerson": '$requester.person',
          "requesterDocument": '$requester.document',  
          "city": '$city',
          "state": '$state',
          "progresses": '$progressDetails'
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

    // busca os dados da demanda do processo
    Demand.findOne({ "_id": req.body.demand }, "+stages")
      .then(rqst => {
        if (!rqst) {
          throw new NotFoundError('Demand not found.')
        } else {


          // cria um novo documento com os atributos do body
          let document = new Process(req.body)
          // salva o documento no banco de dados
          document.save()
            .then(obj => {

              // faz o registro do andamento
              let objProgress = {
                tenant: obj.tenant,
                division: obj.division,
                demand: obj.demand,
                process: obj._id,
                user: req.authenticated._id,
                stage: rqst.stages[0]._id,
                systemGenerated: true,
                occurrence: 'Registro automático'
              }
              let progress = new Progress(objProgress)
              progress.save()
                .then(pgr => {

                  resp.json(obj)

                })
            })
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


  updatePrgrs = (req, resp, next) => {

    Process.findOne({ "_id": req.params.id })
      .then(obj => {

        // faz o registro do andamento
        let objProgress = {
          tenant: obj.tenant,
          division: obj.division,
          demand: obj.demand,
          process: obj._id,
          user: req.authenticated._id,
          stage: req.body.stageId,
          systemGenerated: false,
          occurrence: req.body.occurrence
        }
        let progress = new Progress(objProgress)
        progress.save()
          .then(pgr => {

            // atualiza o registro em processos
            Process.findOneAndUpdate({ "_id": pgr.process }, { "progress": pgr._id })
              .then(resp.json(obj))

          })

      })
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
    application.patch(`${this.basePath}/:id/updateprgrs`, [authorize('user'), this.validateId, this.updatePrgrs])
    application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

  }
}

export const processesRouter = new ProcessesRouter()