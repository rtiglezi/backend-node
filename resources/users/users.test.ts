import 'jest'
import * as request from 'supertest'


let address: string = (<any>global).address
let auth: string = (<any>global).auth


test('get /users', () => {
    return request(address)
        .get('/users')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.items).toBeInstanceOf(Array)
        }).catch(fail)
})

test('post /users', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'Usuario de Teste',
            email: 'uteste@teste.com.br',
            login: 'usuario.teste',
            password: '12345678',
            cpf: '962.116.531-82',
            gender: 'Male'
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('Usuario de Teste')
            expect(response.body.email).toBe('uteste@teste.com.br')
            expect(response.body.login).toBe('usuario.teste')
            expect(response.body.password).toBeUndefined()
            expect(response.body.cpf).toBe('962.116.531-82')
            expect(response.body.gender).toBe('Male')
        }).catch(fail)
})

test('get /users/aaaa - not found', () => {
    return request(address)
        .get('/users/aaaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('patch /users/:id', () => {
    return request(address)
        .post('/users')
        .set('Authorization', auth)
        .send({
            name: 'usuario2',
            email: 'usuario2@email.com',
            login: 'usuario.dois',
            password: '12345678'
        })
        .then(response => request(address)
            .patch(`/users/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'usuario2 - patch'
            }))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('usuario2 - patch')
            expect(response.body.email).toBe('usuario2@email.com')
            expect(response.body.password).toBeUndefined()
        })
        .catch(fail)
})

