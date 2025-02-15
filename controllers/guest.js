const dotenv = require('dotenv')
const { GeneralError } = require('../middlewares/error')
const db = require('../models')
const { Guest } = db

let GUEST_TOKEN_LENGTH = process.env.GUEST_TOKEN_LENGTH
if (process.env.NODE_ENV === 'development') {
  const result = dotenv.config()
  if (result.error) {
    throw result.error
  }
  GUEST_TOKEN_LENGTH = result.parsed.GUEST_TOKEN_LENGTH
}

const generateRandomString = (num) => {
  const result = Math.random()
    .toString(36)
    .substring(2, num + 2)
  return result
}

const guestController = {
  createGuest: async (req, res) => {
    const guestToken = generateRandomString(Number(GUEST_TOKEN_LENGTH))

    const guest = await Guest.create({
      guestToken
    })
    if (!guest) throw new GeneralError('新增 guest 失敗')

    res.status(200).json({
      ok: 1,
      message: '新增 guest 成功',
      guest,
      statusCode: 200
    })
  }
}

module.exports = guestController
