import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'

import { NotAuthorizedError, BadRequestError } from 'restify-errors';
import { environment } from '../common/environment'
import { User } from '../resources/users/users.model'
import { usersRouter } from '../resources/users/users.router';

export const resetPassword: restify.RequestHandler = (req, resp, next) => {
  const token = req.params.token

  if (token) {
    jwt.verify(token, environment.security.emailSecret, applyBearer(req, resp, next))
  } else {
    next(new NotAuthorizedError('Token is required.'))
  }

}

function applyBearer(req: restify.Request, resp, next): (error, decoded) => void {
  return (error, decoded) => {

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

    } else {
      next(new BadRequestError('Invalid token'))
    }


  }
}
