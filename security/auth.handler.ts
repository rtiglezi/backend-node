import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'
import { NotAuthorizedError } from 'restify-errors'
import { User } from '../resources/users/users.model'
import { environment } from '../common/environment'

export const authenticate: restify.RequestHandler = (req, resp, next) => {
  const { email, password } = req.body
  User.findByEmail(email, '+password')
    .then(user => {

      if (!user || !user.matches(password))
        return next(new NotAuthorizedError('Invalid credentials'))
      
        let payload = {
          sub: user.email,
          iss: 'e-proc-api'
        }
      
      const token = jwt.sign(payload, environment.security.apiSecret, { expiresIn: '10h' })
      resp.json({ name: user.name, email: user.email, accessToken: token })
      return next(false)

    }).catch(next)
}
