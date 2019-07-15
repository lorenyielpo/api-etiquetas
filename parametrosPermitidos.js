const parametrosPermitidos = {
    update: ['email'],
    add: ['email', 'senha', 'nome', 'sobrenome', 'idade', 'cidade', 'estado', 'pais', 'profissao'],
    addEtiqueta: ['marca', 'razao_social', 'cnpj', 'pais_de_fabricacao']
 }
  
  module.exports = parametrosPermitidos