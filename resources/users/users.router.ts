
import * as restify from 'restify'
import { User } from './users.model'
import { ModelService } from '../../common/model.service'
import { authenticate } from '../../security/auth.handler'
import { authorize } from '../../security/authz.handler';
import { changePassword } from '../../security/change-password.handler';
import { forgotPassword } from '../../security/forgot-password';
import { resetPassword } from '../../security/reset-password';
import { resetPasswordForm } from '../../security/reset-password-form';
import { usersLastDivision } from './users.last-division.handler';
import { checkOwner } from '../../security/check-owner.handler';


import { NotFoundError } from 'restify-errors'


import * as mongoose from 'mongoose'


class UsersRouter extends ModelService<User>  {

  constructor() {
    super(User)
  }

  validateId = (req, resp, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      next(new NotFoundError('Invalid Id.'))
    } else {
      next()

    }
  }

  findByEmail = (req, resp, next) => {
    let query = {
      "email": req.query.email
    }
    if (req.query.email) {
      User.find(query)
        .then(user => {
          user ? [user] : []
          resp.json(user)
        })
        .catch(next)
    } else {
      next()
    }
  }


  findAll = (req, resp, next) => {
    let query = {
    }
    User.aggregate([
      {
        $match: query
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
        $lookup:
        {
          from: "tenants",
          localField: "tenant",
          foreignField: "_id",
          as: "tenantDetails"
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ])
      .sort({ name: 1 })
      .then(users => {
        resp.json(users)
      }).catch(next)
  }



  findById = (req, resp, next) => {
    let query = {
      "_id": req.params.id
    }
    User.findOne(query)
      .then(obj => {
        resp.json(obj)
      })
      .catch(next)
  }



  save = (req, resp, next) => {
    // cria um novo documento com os atributos do body
    let document = new this.model(req.body)
    // salva o documento no banco de dados
    document.save()
      .then(obj => resp.json(obj))
      .catch(next)
  }



  replace = (req, resp, next) => {
    let query = {
      "_id": req.params.id
    }
    const options = { runValidators: true, overwrite: true }
    User.update(query, req.body, options)
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
    const options = { runValidators: true, new: true }
    User.findOneAndUpdate(query, req.body, options)
      .then(obj => resp.json(obj))
      .catch(next)
  }


  delete = (req, resp, next) => {
    let query = {
      "_id": req.params.id
    }
    User.remove(query)
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
    // rotas para o CRUD de usuarios
    application.get(`${this.basePath}`, [authorize('admin', 'master'), this.findByEmail, this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('admin', 'master'), this.validateId, this.findById])
    application.post(`${this.basePath}`, [authorize('admin', 'master'), this.save])
    application.put(`${this.basePath}/:id`, [authorize('admin', 'master'), this.validateId, this.replace])
    application.patch(`${this.basePath}/:id`, [authorize('admin', 'master'), this.validateId, this.update])
    application.del(`${this.basePath}/:id`, [authorize('admin', 'master'), this.validateId, this.delete])

    // rotas para controle de acesso
    application.post(`${this.basePath}/authenticate`, authenticate)

    application.patch(`${this.basePath}/:id/changepass`, [authorize('user'),
    this.validateId,
      checkOwner,
      changePassword,
    this.update])

    application.get(`${this.basePath}/forgotpass/:email/:linkFront`, forgotPassword)
    application.get(`${this.basePath}/resetpass/form/:token/:linkFront`, resetPasswordForm)
    application.post(`${this.basePath}/resetpass/:token/:linkFront`, resetPassword)

    application.patch(`${this.basePath}/:id/lastdivision`, [authorize('user'),
    this.validateId,
      checkOwner,
      usersLastDivision,
    this.update])

  }

}

export const usersRouter = new UsersRouter()