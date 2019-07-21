import { ModelRouter } from '../../common/model.router'
import * as restify from 'restify'
import { Division } from './divisions.model'

import { authorize } from '../../security/authz.handler';

import { NotFoundError } from 'restify-errors'


class DivisionsRouter extends ModelRouter<Division> {

    constructor() {
        super(Division)
    }


    findBySpecificTenant = (req, resp, next) => {
        let query = {
            "tenant": req.query.tenant
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
        this.model
            .find(query)
            .sort({ name: 1 })
            .then(obj => resp.json(obj))
            .catch(next)
    }


    findById = (req, resp, next) => {
        let query = {
            "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
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
          "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
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
          "_id": req.params.id
        }
        let queryAnd = {}
        Object.assign(query, { "tenant": req.authenticated.tenant })
        const options = { runValidators: true, new: true }
        Division.findOneAndUpdate({ $and: [query, queryAnd] }, req.body, options)
          .then(obj => resp.json(obj))
          .catch(next)
      }
    
    
      delete = (req, resp, next) => {
        let query = {
          "_id": req.params.id
        }
        Object.assign(query, { "tenant": req.authenticated.tenant })
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