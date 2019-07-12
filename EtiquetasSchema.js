const mongoose = require('mongoose');
// cada schema equivale collection
const Schema = mongoose.Schema;
const EtiquetasSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  marca: { type: String, required: true },
  razao_social: { type: String, required: true },
  cnpj: { type: String, required: true },
  pais_de_fabricacao: { type: String, required: true }
})

const etiquetasModel = mongoose.model('etiquetas', EtiquetasSchema)

module.exports = {
  etiquetasModel, 
  EtiquetasSchema
}

