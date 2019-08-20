import * as restify from 'restify'
import * as mongoose from 'mongoose'

import { authorize } from '../../security/authz.handler';
import { NotFoundError } from 'restify-errors'
import { ModelRouter } from '../../common/model.router'

import { Division } from './../divisions/divisions.model';
import { Process } from './processes.model';
import { Demand } from '../demands/demands.model';
import { Progress } from '../progresses/progresses.model';
import { Automatic } from '../automatics/automatics.model';
import { User } from '../users/users.model';


class ProcessesRouter extends ModelRouter<Process> {

  constructor() {
    super(Process)
  }

  findAll = (req, resp, next) => {

    let query = {
      "tenantId": req.authenticated.tenant,
      "divisionId": req.authenticated.lastDivision
    }

    if (req.query.number) {
      Object.assign(query, {"number": { $regex: escape(req.query.number) }})
    }

    Process.aggregate([
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
      {
        $lookup:
        {
          from: "progresses",
          localField: "_id",
          foreignField: "process",
          as: "progressDetails"
        }
      },
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
          "userId": '$userDetails._id',
          "userName": '$userDetails.name',
          "requesterId": '$requester._id',
          "requesterName": '$requester.name',
          "requesterPerson": '$requester.person',
          "requesterDocument": '$requester.document',
          "city": '$city',
          "state": '$state',
          "submitted": '$submitted',
          "progresses": '$progressDetails'
        }
      },
      {
        $match: query
      }
    ])
      .sort({ number: 1 })
      .then(processes => {
        resp.json(processes)
      }).catch(next)
  }



  findById = (req, resp, next) => {
    let query = {
       "processId": mongoose.Types.ObjectId(req.params.id),
       "tenantId": req.authenticated.tenant
    }
    Process.aggregate([
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
      {
        $lookup:
        {
          from: "progresses",
          localField: "_id",
          foreignField: "process",
          as: "progressDetails"
        }
      },
      {
        $project: {
          "processId": '$_id',
          "updated_at": '$updated_at',
          "number": '$number',
          "tenantId": '$tenantDetails._id',
          "tenantName": '$tenantDetails.name',
          "divisionId": '$divisionDetails._id',
          "divisionName": '$divisionDetails.name',
          "demandId": '$demandDetails._id',
          "demandName": '$demandDetails.name',
          "userId": '$userDetails._id',
          "userName": '$userDetails.name',
          "requesterId": '$requester._id',
          "requesterName": '$requester.name',
          "requesterPerson": '$requester.person',
          "requesterDocument": '$requester.document',
          "city": '$city',
          "state": '$state',
          "submitted": '$submitted',
          "progresses": '$progressDetails',
          "requester": '$requester',
          "division": '$division',
          "demand": '$demand',
          "protocolDate": '$protocolDate'
        }
      },
      {
        $match: query
      }
    ])
      .sort({ number: 1 })
      .then(processes => {
        resp.json(processes[0])
      }).catch(next)
  }


  save = (req, resp, next) => {
    // insere a identificação do inquilino no "body" da requisição
    req.body.tenant = req.authenticated.tenant
    // busca os dados da demanda do processo
    let query = {
      "_id": req.body.demand,
      "tenant": req.authenticated.tenant
    }
    Demand.findOne(query, "+stages")
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
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
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
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    const options = { runValidators: true, new: true }
    Process.findOneAndUpdate(query, req.body, options)
      .then(obj => resp.json(obj))
      .catch(next)
  }


  updatePrgrs = (req, resp, next) => {
    let query = {
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    Process.findOne(query)
      .then(obj => {
        // faz o registro do andamento
        let objProgress = {
          tenant: obj.tenant,
          division: obj.division,
          demand: obj.demand,
          process: obj._id,
          user: req.authenticated._id,
          stage: req.body.stageId,
          result: req.body.resultId,
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
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
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


  send = (req, resp, next) => {
    let selectedProcesses = req.body.processesId
    let division = req.body.divisionId
    let promise = selectedProcesses.map(selecProc => {
      let query = {
        "_id": escape(selecProc),
        "tenant": req.authenticated.tenant
      }
      Process.findOneAndUpdate(query, { "division": division, "user": null, submitted: true }, req.body)
        .then(obj => {
          Division.findOne({ "_id": division })
            .then(div => {
              // faz o registro do andamento
              let objAutomatic = {
                tenant: obj.tenant,
                division: obj.division,
                demand: obj.demand,
                process: obj._id,
                user: req.authenticated._id,
                systemGenerated: true,
                stage: "Tramitação",
                occurrence: `Processo tramitado para a unidade: ${div.name}`
              }
              let automatic = new Automatic(objAutomatic)
              automatic.save()
                .then(pgr => {
                  // atualiza o registro em processos
                  Process.findOneAndUpdate({ "_id": pgr.process }, { "progress": pgr._id })
                    .then(resp.json(obj))
                })
            })
        })
    })
    Promise.all(promise).then(res => {
      resp.json(promise)
    })
  }

  assign = (req, resp, next) => {
    let selectedProcesses = req.body.processesId
    let user = req.body.userId
    let promise = selectedProcesses.map(selecProc => {
      let query = {
        "_id": escape(selecProc),
        "tenant": req.authenticated.tenant
      }
      Process.findOneAndUpdate(query, { "user": user }, req.body)
        .then(obj => {
          User.findOne({ "_id": user })
            .then(usr => {
              // faz o registro do andamento
              let objAutomatic = {
                tenant: obj.tenant,
                division: obj.division,
                demand: obj.demand,
                process: obj._id,
                user: req.authenticated._id,
                systemGenerated: true,
                stage: "Atribuição",
                occurrence: `Processo atribuído para o usuário: ${usr.name}`
              }
              let automatic = new Automatic(objAutomatic)
              automatic.save()
                .then(pgr => {
                  // atualiza o registro em processos
                  Process.findOneAndUpdate({ "_id": pgr.process }, { "progress": pgr._id })
                    .then(resp.json(obj))
                })
            })
        })
    })
    Promise.all(promise).then(res => {
      resp.json(promise)
    })
  }



  receive = (req, resp, next) => {
    let processId = req.params.id
    let query = {
      "_id": processId,
      "tenant": req.authenticated.tenant
    }
    Process.findOneAndUpdate(query, { "submitted": false }, req.body)
      .then(obj => {
        // faz o registro do andamento
        let objAutomatic = {
          tenant: obj.tenant,
          division: obj.division,
          demand: obj.demand,
          process: obj._id,
          user: req.authenticated._id,
          systemGenerated: true,
          stage: "Recebimento",
          occurrence: `Processo recebido pelo usuário: ${req.authenticated.name}`
        }
        let automatic = new Automatic(objAutomatic)
        automatic.save()
          .then(pgr => {
            // atualiza o registro em processos
            Process.findOneAndUpdate({ "_id": pgr.process }, { "progress": pgr._id })
              .then(resp.json(obj))
          })
      })
  }




  applyRoutes(application: restify.Server) {
    application.get(`${this.basePath}`, [authorize('admin', 'user'), this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.findById])
    application.post(`${this.basePath}`, [authorize('admin'), this.save])
    application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
    application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
    application.patch(`${this.basePath}/:id/updateprgrs`, [authorize('user'), this.validateId, this.updatePrgrs])
    application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

    application.post(`${this.basePath}/assign`, [authorize('user'), this.assign])
    application.post(`${this.basePath}/send`, [authorize('user'), this.send])
    application.post(`${this.basePath}/:id/receive`, [authorize('user'), this.validateId, this.receive])


  }
}

export const processesRouter = new ProcessesRouter()