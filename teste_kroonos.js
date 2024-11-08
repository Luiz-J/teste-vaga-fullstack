//Para lidar com um arquivo CSV grande, precisei instalar bibliotecas ao criar o projeto, apenas isso. Segue abaixo os comandos usados:\line\line //mkdir teste-kronoos\par
//cd teste-kronoos\par
//npm init -y\par
//npm install csv-parser\line\par
//Abaixo daqui segue todo o c\'f3digo do projeto!\line\line const fs = require('fs')\par
const fs = require('fs')
const csv = require('csv-parser')

// Função para processar o CSV (o arquivo data.csv fornecido para o teste)
function processarCSV(caminhoArquivo) {
    return new Promise((resolver, rejeitar) => {
        const resultados = []
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (dados) => resultados.push(dados))
            .on('end', () => resolver(resultados))
            .on('error', (erro) => rejeitar(erro))
    })
}

// Função para formatar valores como moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

// Segue a função de Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

    let soma = 0, resto
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false

    soma = 0
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    return resto === parseInt(cpf.substring(10, 11))
}

// Segue a função de Validação de CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '')
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho)
    let digitos = cnpj.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--
        if (pos < 2) pos = 9
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== parseInt(digitos.charAt(0))) return false

    tamanho += 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--
        if (pos < 2) pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    return resultado === parseInt(digitos.charAt(1))
}

// Segue a função de Função para validar prestações
function validarPrestacoes(vlTotal, qtPrestacoes, vlPresta) {
    const prestacaoCalculada = vlTotal / qtPrestacoes
    return Math.abs(prestacaoCalculada - vlPresta) < 0.01
}

// Função principal
async function main() {
    try {
        const dados = await processarCSV('data.csv')
        
        dados.forEach(item => {
            const cpfCnpjValido = item.nrCpfCnpj.length === 11 
                ? validarCPF(item.nrCpfCnpj) 
                : validarCNPJ(item.nrCpfCnpj)

            const prestacoesValidas = validarPrestacoes(
                parseFloat(item.vlTotal),
                parseInt(item.qtPrestacoes),
                parseFloat(item.vlPresta)
            )

            // Exibidno todos os resultados de cada item do 'data.csv'
            console.log({
                cpfCnpj: cpfCnpjValido,
                prestacoes: prestacoesValidas,
                totalFormatado: formatarMoeda(parseFloat(item.vlTotal)),
            })
        })
    } catch (erro) {
        console.error('Erro ao processar:', erro)
    }
}

// E abaixo executa o processamento do 'data.csv'
main()

 
