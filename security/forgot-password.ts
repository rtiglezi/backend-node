import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import { User } from '../resources/users/users.model'
import { NotFoundError } from 'restify-errors'

import { environment } from '../common/environment';
import { sendMail } from '../common/sendGridEmail';


export const forgotPassword = (req, resp, next) => {
  
  const { email, linkFront } = req.params

  User.findByEmail(email, '+password')
    .then(user => {
      if (!user)
        return next(new NotFoundError('E-mail not found.'))
      bcrypt.hash(user.password, environment.security.saltRounds)
        .then(() => {
          let payload = {
            sub: user.email,
            iss: 'e-proc-api'
          }
          const token = jwt.sign(payload, environment.security.emailSecret, { expiresIn: '1h' })
          const linkBack = `users/resetpass/form/${token}/${linkFront}`

          let sbj = "Troca de senha."
          let txt = `Olá, ${user.name}. Realize sua troca de senha.`
          let tag = `
            Olá, ${user.name}.<br/>
            Conforme sua solicitação, segue o link para realizar a redefinição de sua senha:<br/>
            <br/>
            <a href='http://localhost:3000/${linkBack}'>Clique aqui para redefinir sua senha.</a>
            `

          sendMail(user.email, sbj, txt, tag)
        
          resp.send(200, {msg: 'Mail sent.'});
          
        }).catch(next)
    })

}