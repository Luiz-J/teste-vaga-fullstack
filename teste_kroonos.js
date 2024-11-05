{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang1046{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\*\generator Riched20 10.0.22621}\viewkind4\uc1 
\pard\sa200\sl276\slmult1\f0\fs22\lang22 //Para lidar com um arquivo CSV grande, precisei instalar bibliotecas ao criar o projeto, apenas isso. Segue abaixo os comandos usados:\line\line //mkdir teste-kronoos\par
//cd teste-kronoos\par
//npm init -y\par
//npm install csv-parser\line\par
//Abaixo daqui segue todo o c\'f3digo do projeto!\line\line const fs = require('fs')\par
const csv = require('csv-parser')\par
\par
// Fun\'e7\'e3o para processar o CSV (neste caso, o arquivo data.csv fornecido)\par
function processarCSV(caminhoArquivo) \{\par
    return new Promise((resolver, rejeitar) => \{\par
        const resultados = []\par
        fs.createReadStream(caminhoArquivo)\par
            .pipe(csv())\par
            .on('data', (dados) => resultados.push(dados))\par
            .on('end', () => resolver(resultados))\par
            .on('error', (erro) => rejeitar(erro))\par
    \})\par
\}\par
\par
// Fun\'e7\'e3o para formatar valores como moeda brasileira\par
function formatarMoeda(valor) \{\par
    return new Intl.NumberFormat('pt-BR', \{ style: 'currency', currency: 'BRL' \}).format(valor)\par
\}\par
\par
// Valida\'e7\'e3o de CPF\par
function validarCPF(cpf) \{\par
    cpf = cpf.replace(/[^\\d]+/g, '')\par
    if (cpf.length !== 11 || /^(\\d)\\1+$/.test(cpf)) return false\par
\par
    let soma = 0, resto\par
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)\par
    resto = (soma * 10) % 11\par
    if (resto === 10 || resto === 11) resto = 0\par
    if (resto !== parseInt(cpf.substring(9, 10))) return false\par
\par
    soma = 0\par
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)\par
    resto = (soma * 10) % 11\par
    if (resto === 10 || resto === 11) resto = 0\par
    return resto === parseInt(cpf.substring(10, 11))\par
\}\par
\par
// Valida\'e7\'e3o de CNPJ\par
function validarCNPJ(cnpj) \{\par
    cnpj = cnpj.replace(/[^\\d]+/g, '')\par
    if (cnpj.length !== 14 || /^(\\d)\\1+$/.test(cnpj)) return false\par
\par
    let tamanho = cnpj.length - 2\par
    let numeros = cnpj.substring(0, tamanho)\par
    let digitos = cnpj.substring(tamanho)\par
    let soma = 0\par
    let pos = tamanho - 7\par
    for (let i = tamanho; i >= 1; i--) \{\par
        soma += numeros.charAt(tamanho - i) * pos--\par
        if (pos < 2) pos = 9\par
    \}\par
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)\par
    if (resultado !== parseInt(digitos.charAt(0))) return false\par
\par
    tamanho += 1\par
    numeros = cnpj.substring(0, tamanho)\par
    soma = 0\par
    pos = tamanho - 7\par
    for (let i = tamanho; i >= 1; i--) \{\par
        soma += numeros.charAt(tamanho - i) * pos--\par
        if (pos < 2) pos = 9\par
    \}\par
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)\par
    return resultado === parseInt(digitos.charAt(1))\par
\}\par
\par
// Fun\'e7\'e3o para validar presta\'e7\'f5es\par
function validarPrestacoes(vlTotal, qtPrestacoes, vlPresta) \{\par
    const prestacaoCalculada = vlTotal / qtPrestacoes\par
    return Math.abs(prestacaoCalculada - vlPresta) < 0.01\par
\}\par
\par
// Fun\'e7\'e3o principal\par
async function main() \{\par
    try \{\par
        // L\'ea o arquivo 'data.csv' diretamente\par
        const dados = await processarCSV('data.csv')\par
        \par
        dados.forEach(item => \{\par
            // Checa CPF ou CNPJ\par
            const cpfCnpjValido = item.nrCpfCnpj.length === 11 \par
                ? validarCPF(item.nrCpfCnpj) \par
                : validarCNPJ(item.nrCpfCnpj)\par
\par
            // Valida presta\'e7\'f5es\par
            const prestacoesValidas = validarPrestacoes(\par
                parseFloat(item.vlTotal),\par
                parseInt(item.qtPrestacoes),\par
                parseFloat(item.vlPresta)\par
            )\par
\par
            // Exibe resultados de cada item do 'data.csv'\par
            console.log(\{\par
                cpfCnpj: cpfCnpjValido,\par
                prestacoes: prestacoesValidas,\par
                totalFormatado: formatarMoeda(parseFloat(item.vlTotal)),\par
            \})\par
        \})\par
    \} catch (erro) \{\par
        console.error('Erro ao processar:', erro)\par
    \}\par
\}\par
\par
// Executa o processamento do 'data.csv'\par
main()\par
}
 