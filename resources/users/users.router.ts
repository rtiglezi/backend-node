
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


class UsersRouter extends ModelService<User>  {

  constructor() {
    super(User)
  }

  findByEmail = (req, resp, next) => {
    if (req.query.email) {
      User.find(
        {
          "tenant_id": req.authenticated.tenant_id,
          "email": req.query.email
        })
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
    User.aggregate([
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
      .then(users => {
        resp.json(users)
      }).catch(next)
  }


  applyRoutes(application: restify.Server) {
    // rotas para o CRUD de usuarios
    application.get(`${this.basePath}`, [authorize('admin'), this.findByEmail, this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById])
    application.post(`${this.basePath}`, [authorize('admin'), this.save])
    application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
    application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
    application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

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

/* instanciar esta classe e disponibilizá-la para
   que outras partes da aplicação possam utilizar,
   por exemplo na invocação do método "bootstrap"
   no arquivo main.ts */
export const usersRouter = new UsersRouter()