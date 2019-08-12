import * as restify from 'restify';
import * as mongoose from 'mongoose';

import { NotFoundError } from 'restify-errors';
import { ModelRouter } from '../../common/model.router';
import { authorize } from '../../security/authz.handler';

import { Progress } from './progresses.model';

class ProgressesRouter extends ModelRouter<Progress> {

  constructor() {
    super(Progress)
  }

  findAll = (req, resp, next) => {
    let query = {
      tenant: req.authenticated.tenant
    }
    if (req.query.processId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.processId)) {
        next(new NotFoundError('Invalid Id.'))
      } else {
        Object.assign(query, { process: mongoose.Types.ObjectId(req.query.processId) })
      }
    }
    Progress.aggregate([
      {
        $match: query
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
          "processId": '$processDetails._id',
          "processNumber": '$processDetails.number',
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
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    Progress.findOne(query)
      .then(obj => {
        resp.json(obj)
      })
      .catch(next)
  }

  applyRoutes(application: restify.Server) {
    application.get(`${this.basePath}`, [authorize('user'), this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('user'), this.validateId, this.findById])
  }
}

export const progressesRouter = new ProgressesRouter()