import * as restify from 'restify'
import { User } from '../resources/users/users.model'
import { NotAuthorizedError, BadRequestError } from 'restify-errors';
import * as jwt from 'jsonwebtoken'
import { environment } from '../common/environment'
import { usersRouter } from '../resources/users/users.router';

export const resetPassword: restify.RequestHandler = (req, resp, next) => {
  const token = req.query.token
  if (token) {
    jwt.verify(token, environment.security.emailSecret, applyBearer(req, resp, next))
  } else {
    next(new NotAuthorizedError('Invalid token.'))
  }
}

function applyBearer(req: restify.Request, resp, next): (error, decoded) => void {
  return (error, decoded) => {

    if (error)
      next(new BadRequestError({ error }))

    if (decoded) {
      User.findByEmail(decoded.sub).then(user => {
        if (user) {
          const { newPassword } = req.body
          if (newPassword) {
            req.body = user
            req.body.password = newPassword
            req.params = {
              id: req.body._id
            }
            usersRouter.update(req, resp, next)
          } else {
            next(new BadRequestError("New password is required."))
          }
        }
      }).catch(error)
    }
  }
}
