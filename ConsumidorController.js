require('dotenv-safe').load()
const  {connect} = require('./ConsumidorRepository')
const consumidoresModel = require('./ConsumidorSchema')
const {etiquetasModel}  = require('./EtiquetasSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

connect()

const getAll = () => {
    return consumidoresModel.find((error, consumidores) => {
        return consumidores
    })
}

const getById = (id) => {
    return consumidoresModel.findById(id)
}

const add = async (consumidor) => {
    const consumidorEncontrado = await consumidoresModel.findOne(
        { email: consumidor.email }
    )

    if (consumidorEncontrado) {
        throw new Error('Email já cadastrado')
    }

    const salt = bcrypt.genSaltSync(10)
    const senhaCriptografada = bcrypt.hashSync(consumidor.senha, salt)
    consumidor.senha = senhaCriptografada

    const novoConsumidor = new consumidoresModel(consumidor)
    return novoConsumidor.save()
}

const update = (id, consumidor) => {
    return consumidoresModel.findByIdAndUpdate(
        id,
        { $set: consumidor },
        { new: true },
    )
}

const addEtiqueta = async (consumidorId, etiqueta) => {
    const consumidor = await getById(consumidorId)
    const novaEtiqueta = new etiquetasModel(etiqueta)

    consumidor.etiquetas.push(novaEtiqueta)
    return consumidor.save()
}

const login = async (dadosDoLogin) => {
    const consumidorEncontrado = await consumidoresModel.findOne(
      { email: dadosDoLogin.email }
    )
  
    if (consumidorEncontrado) {
      const senhaCorreta = bcrypt.compareSync(
        dadosDoLogin.senha, consumidorEncontrado.senha
      )
  
      if (senhaCorreta) {
        const token = jwt.sign(
          {
            email: consumidorEncontrado.email,
            id: consumidorEncontrado._id
          },
          process.env.PRIVATE_KEY
        )
        return { auth: true, token };
      } else {
        throw new Error('Dados incorretos')
      }
    } else {
      throw new Error('Dados incorretos')
    }
  }

  const getEtiquetas = async consumidorId => {
    const consumidor = await getById(consumidorId)
    return consumidor.etiquetas
  }

module.exports = {
    getAll,
    getById,
    add,
    update,
    addEtiqueta,
    login,
    getEtiquetas
}
