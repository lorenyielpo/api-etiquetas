const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const nodemailer = require("nodemailer")
const servidor = express()
const consumidorController = require('./ConsumidorController')
const params = require('params')
const parametrosPermitidos = require('./parametrosPermitidos')
const PORT = process.env.PORT || 6001
const jwt = require('jsonwebtoken')
const logger = (request, response, next) => {
    console.log(`${new Date().toISOString()} Request type: ${request.method} to ${request.originalUrl}`)

    response.on('finish', () => {
        console.log(`${response.statusCode} ${response.statusMessage};`)
    })

    next()
}

servidor.use(bodyParser())
servidor.use(cors())
servidor.use(bodyParser.json())
servidor.use(logger)

servidor.get('/', (request, response) => {
    response.send('./')
})

const config = {
    host: 'smtp.mailtrap.io',
    port: '25',
    auth: {
        user: 'ea63b2d5698d08',
        pass: '989b7fcc73329d'
    }
}

const transporter = nodemailer.createTransport(config)

// rotas Consumidores

servidor.get('/consumidores', (request, response) => {
    consumidorController.getAll()
        .then(consumidorController => {
            response.send(consumidorController)           
        })
        .catch(error => {
            if (error.name === 'CastError') {
                response.status(400)
            } else {
                response.sendStatus(500)
            }
        })
})

servidor.get('/consumidores/:consumidorId', (request, response) => {
    const { consumidorId } = request.params
    consumidorController.getById(consumidorId)
        .then(consumidor => {
            if (!consumidor) {
                response.sendStatus(404)
            } else {
                response.send(consumidor)
            }
        })
        .catch(error => {
            if (error.name === 'CastError') {
                response.sendStatus(400)
            } else {
                response.sendStatus(500)
            }
        })
})

servidor.post('/consumidores', (request, response) => {
    consumidorController.add(params(request.body).only(parametrosPermitidos.add))
        .then(consumidor => {
            const _id = consumidor._id
            response.send(_id)
        })
        .catch(error => {
            if (error.name === 'ValidationError') {
                response.sendStatus(400)
            } else {
                console.log(error)
                response.sendStatus(500)
            }
        })
})

servidor.patch('/consumidores/:consumidorId', (request, response) => {

    const authHeader = request.get('authorization')
    let auth = false

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.PRIVATE_KEY, function (error, decoded) {
            if (error) {
                response.send(403)
            } else {
                auth = true
            }
        })
    } else {
        response.send(401)
    }

    if (auth) {
        const { consumidorId } = request.params
        consumidorController.update(consumidorId, params(request.body).only(parametrosPermitidos.update))
            .then(consumidor => {
                if (!consumidor) { response.sendStatus(404) }
                else { response.send(consumidor) }
            })
            .catch(error => {
                if (error.name === 'MongoError' || error.name === 'CastError') {
                    response.sendStatus(400)
                } else {
                    response.sendStatus(500)
                }
            })
    }
})

servidor.post('/consumidores/adicionar-etiqueta/:consumidorId', async(request, response) => {

    const authHeader = request.get('Authorization')
    let auth = false

    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.PRIVATE_KEY, function (error, decoded) {
            if (error) {
                response.sendStatus(403)
            } else {
                auth = true
            }
        })
    } else {
        response.send(401)
    }

    if (auth) {
        const { consumidorId } = request.params
        const etiqueta = params(request.body).only(parametrosPermitidos.addEtiqueta)
        consumidorController.addEtiqueta(consumidorId, etiqueta)
            .then(consumidor => {
                const _id = consumidor._id
                response.send(_id)
            })
            .catch(error => {
                if (error.name === 'ValidationError') {
                    response.sendStatus(400)
                } else {
                    console.log(error)
                    response.sendStatus(500)
                }
            })
    }

})

servidor.get('/consumidores/:consumidorId/etiquetas', async (request, response) => {
    const { consumidorId } = request.params
    consumidorController.getEtiquetas(consumidorId)
        .then(etiquetas => response.send(etiquetas))
})

servidor.post('/consumidores/login', (request, response) => {
    consumidorController.login(request.body)
        .then(respostaDoLogin => {
            response.send(respostaDoLogin)
        })
        .catch(error => {
            if (error.name === 'ValidationError') {
                console.log(error)
                response.sendStatus(400)
            } else {
                console.log(error)
                response.sendStatus(500)
            }
        })
})

servidor.post('/send-email', (request, response)=>{
    const {email} = request.body
    const {nome} = request.body
    const message = {
        from: 'lorenyielpo@gmail.com',
        to: `'${email}'`,
        subject: 'Obrigada',
        text: `'Olá, ${nome}Obrigada por se inscrever na nossa newsletter! <3'`
    }

    transporter.sendMail(message, (error, info)=>{
        if(error){
           return response.status(400).send('falhou')
        }

        return response.status(200).send('enviou')
    })

    return response.sendStatus(200).end()
})

servidor.listen(PORT)
console.info(`Rodando na porta ${PORT}`)




