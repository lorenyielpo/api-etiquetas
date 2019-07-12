const mongoose = require('mongoose');
const { EtiquetasSchema } = require('./EtiquetasSchema')
const Schema = mongoose.Schema;
const ConsumidoresSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  idade: { type: Number, required: true },
  cidade: { type: String, required: true }, 
  estado: { type: String, required: true },
  pais: { type: String, required: true }, 
  profissao: { type: String, required: true },
  etiquetas: [EtiquetasSchema]
})

const consumidoresModel = mongoose.model('consumidores', ConsumidoresSchema);

module.exports = consumidoresModel;