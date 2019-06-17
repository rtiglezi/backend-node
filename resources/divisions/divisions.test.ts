import 'jest'
import * as request from 'supertest'

const address: string = (<any>global).address
const auth: string = (<any>global).auth

test('get /divisions', () => {
    return request(address)
        .get('/divisions')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.items).toBeInstanceOf(Array)
        }).catch(fail)
})

test('post /divisions', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Division 01'
            })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('Division 01')
        }).catch(fail)
})

test('post /divisions - nome obrigatorio', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
        })
        .then(response => {
            expect(response.status).toBe(400)
            expect(response.body.errors).toBeInstanceOf(Array)
            expect(response.body.errors[0].message).toContain('name')
        })
        .catch(fail)
})



test('get /divisions/aaaaa - not found', () => {
    return request(address)
        .get('/divisions/aaaaa')
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('get /divisions/:id', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Division 02'
        }).then(response => request(address)
            .get(`/divisions/${response.body._id}`).set('Authorization', auth))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Division 02')
        }).catch(fail)
})

test('delete /division/aaaaa - not found', () => {
    return request(address)
        .delete(`/divisions/aaaaa`)
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('delete /divisions:/id', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Divison 03'
        }).then(response => request(address)
            .delete(`/divisions/${response.body._id}`)
            .set('Authorization', auth))
        .then(response => {
            expect(response.status).toBe(204)
        }).catch(fail)

})

test('patch /divisions/aaaaa - not found', () => {
    return request(address)
        .patch(`/divisions/aaaaa`)
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('post /divisions - nome duplicado', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Division 03'
        }).then(response =>
            request(address)
                .post('/divisions')
                .set('Authorization', auth)
                .send({
                    name: 'Division 03'
                }))
        .then(response => {
            expect(response.status).toBe(400)
            expect(response.body.message).toContain('E11000 duplicate key')
        })
        .catch(fail)
})



test('patch /divisions/:id', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Division 04'
        })
        .then(response => request(address)
            .patch(`/divisions/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'Division QUATRO'
            }))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('Division QUATRO')
        })
        .catch(fail)
})

test('put /divisions/aaaaa - not found', () => {
    return request(address)
        .put(`/divisions/aaaaa`)
        .set('Authorization', auth)
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('put /divisions:/id', () => {
    return request(address)
        .post('/divisions')
        .set('Authorization', auth)
        .send({
            name: 'Division 05'
        }).then(response => request(address)
            .put(`/divisions/${response.body._id}`)
            .set('Authorization', auth)
            .send({
                name: 'Division CINCO'
            }))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Division CINCO')
        }).catch(fail)

})