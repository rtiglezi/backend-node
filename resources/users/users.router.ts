import * as restify from 'restify'
import { User } from './users.model'
import { ModelRouter } from '../../common/model.router'
import { authenticate } from '../../security/auth.handler'
import { authorize } from '../../security/authz.handler';
import { changePassword } from '../../security/change-password.handler';
import { forgotPassword } from '../../security/forgot-password';
import { resetPassword } from '../../security/reset-password';
import { resetPasswordForm } from '../../security/reset-password-form';
import { usersLastDivision } from './users.last-division.handler';
import { checkOwner } from '../../security/check-owner.handler';


class UsersRouter extends ModelRouter<User> {

  constructor() {
    super(User)
    /* método "beforeRender" criado no 
       router.ts */
    this.on('beforeRender', document => {
      // modificando o documento
      document.password = undefined
      /* para não mostrar a senha
         após o post de criação de
         novo usuário */
    })
  }

  // findById = (req, resp, next) => {
  //     this.model.findById(req.params.id)
  //               .populate("division", "name")
  //               .then(this.render(resp,next))
  //               .catch(next)
  // }

  findByEmail = (req, resp, next) => {
    if (req.query.email) {
      User.findByEmail(req.query.email)
        .then(user => user ? [user] : [])
        .then(this.renderAll(resp, next, {
          pageSize: this.pageSize,
          url: req.url
        }))
        .catch(next)
    } else {
      next()
    }
  }


  applyRoutes(application: restify.Server) {
    // rotas para o CRUD de usuarios
    application.get(`${this.basePath}`, [this.findByEmail, this.findAll])
    application.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById])
    application.post(`${this.basePath}`, [ this.save])
    application.put(`${this.basePath}/:id`, [this.validateId, this.replace])
    application.patch(`${this.basePath}/:id`, [this.validateId, this.update])
    application.del(`${this.basePath}/:id`, [this.validateId, this.delete])
    
    // rotas para controle de acesso
    application.post(`${this.basePath}/authenticate`, authenticate)

    application.patch(`${this.basePath}/:id/changepass`, [ authorize('user'), 
                                                           this.validateId,
                                                           checkOwner, 
                                                           changePassword, 
                                                           this.update ])
    
    application.post(`${this.basePath}/forgotpass`, forgotPassword)
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