import * as restify from 'restify';

import { authorize } from '../../security/authz.handler';
import { NotFoundError } from 'restify-errors';
import { ModelRouter } from '../../common/model.router';

import { Division } from './divisions.model';


class DivisionsRouter extends ModelRouter<Division> {

  constructor() {
    super(Division)
  }

  findBySpecificTenant = (req, resp, next) => {
    let query = {
      "tenant": escape(req.query.tenant)
    }
    if (req.query.tenant) {
      Division.find(query)
        .then(division => {
          division ? [division] : []
          resp.json(division)
        })
        .catch(next)
    } else {
      next()
    }
  }


  findAll = (req, resp, next) => {

    let query = { "tenant": req.authenticated.tenant }

    let profiles = req.authenticated.profiles
    let allowedDivisions = req.authenticated.allowedDivisions
    if ((profiles.indexOf('master') == -1) && (profiles.indexOf('admin') == -1)) {
      Object.assign(query, { "_id": { $in: allowedDivisions } })
    }

    this.model
      .find(query)
      .sort({ name: 1 })
      .then(obj => resp.json(obj))
      .catch(next)
  }


  findById = (req, resp, next) => {
    let query = {
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    Division.findOne(query)
      .then(obj => {
        resp.json(obj)
      })
      .catch(next)
  }


  save = (req, resp, next) => {
    // insere a identificação do inquilino no "body" da requisição
    req.body.tenant = req.authenticated.tenant
    // cria um novo documento com os atributos do body
    let document = new Division(req.body)
    // salva o documento no banco de dados
    document.save()
      .then(obj => resp.json(obj))
      .catch(next)
  }


  replace = (req, resp, next) => {
    let query = {
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    const options = { runValidators: true, overwrite: true }
    Division.update(query, req.body, options)
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
    Division.findOneAndUpdate(query, req.body, options)
      .then(obj => resp.json(obj))
      .catch(next)
  }


  delete = (req, resp, next) => {
    let query = {
      "_id": req.params.id,
      "tenant": req.authenticated.tenant
    }
    Division.remove(query)
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

export const divisionsRouter = new DivisionsRouter()