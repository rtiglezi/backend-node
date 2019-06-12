import * as restify from 'restify'
import { User } from '../users/users.model'
import { NotFoundError } from 'restify-errors'

import * as bcrypt from 'bcrypt'
import { environment } from './../common/environment';
import * as jwt from 'jsonwebtoken'
import { sendMail } from '../common/sendGridEmail';


export const forgotPassword: restify.RequestHandler = (req, resp, next) => {
  const { email } = req.body

  User.findByEmail(email, '+password')
    .then(user => {
      if(!user)
        return next(new NotFoundError('E-mail not found.'))
        bcrypt.hash(user.password, environment.security.saltRounds)
        .then(() => {
            let payload = {
              sub: user.email, 
              iss: 'e-proc-api'
            }
            const token = jwt.sign(payload, environment.security.emailSecret, { expiresIn: '1h' })
            
            let sbj  = "Troca de senha."
          let txt  = `Olá, ${user.name}. Realize sua troca de senha.`
            let tag = `
            Olá, ${user.name}.<br/>
            Conforme sua solicitação, segue link para realizar a troca de sua senha.<br/>
            <br/>
            <a href='http://localhost:3000/users/resetpass?token=${token}'>Clique aqui para alterar sua senha.</a>
            `
    
            sendMail(user.email, sbj, txt, tag)

            resp.json({token})
        
          }).catch(next)
    })
    
}