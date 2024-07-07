const crypto = require('crypto')
const dotenv = require('dotenv')

let {
  CRYPTO_ALGORITHM: algorithm,
  CRYPTO_KEY: key,
  CRYPTO_IV: iv
} = process.env
if (process.env.NODE_ENV === 'development') {
  const result = dotenv.config()
  if (result.error) {
    throw result.error
  }
  algorithm = result.parsed.CRYPTO_ALGORITHM
  key = result.parsed.CRYPTO_KEY
  iv = result.parsed.CRYPTO_IV
}

function encrypt (text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  cipher.update(text, 'utf8')
  return cipher.final('hex')
}

function decrypt (text) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.update(text, 'hex')
  return decipher.final('utf8')
}

module.exports = { encrypt, decrypt }
