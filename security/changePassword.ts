import * as restify from 'restify'
import { User } from './../users/users.model'
import { ForbiddenError, NotAuthorizedError, BadRequestError } from 'restify-errors';

export const changePassword: restify.RequestHandler = (req, resp, next) => {
  const { password, newPassword } = req.body

  if (req.authenticated.id != req.params.id)
    return next(new ForbiddenError('Permission denied'))

  User.findByEmail(req.authenticated.email, '+password')
    .then(user => {

      if (!password || !user)
        return next(new NotAuthorizedError('Invalid credentials'))

      if (!user.matches(password))
        return next(new NotAuthorizedError('Password is not correct.'))

      if (!newPassword)
        return next(new BadRequestError('New password is required.'))

      if (newPassword === password)
        return next(new BadRequestError('New password has to be different from current password.'))

      if (newPassword.length < 8)
        return next(new BadRequestError('Password has to be at least 8 caracters.'))

      req.body = { password: newPassword }
      return next()

    })

}