const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const db = require('../models')
const {
  MissingError,
  GeneralError,
  VerifyError,
  NotFound
} = require('../middlewares/error')
const { emailToJwtToken } = require('../middlewares/authority')

const { User } = db

let SALTROUNDS = process.env.SALTROUNDS
if (process.env.NODE_ENV === 'development') {
  const result = dotenv.config()
  if (result.error) {
    throw result.error
  }
  SALTROUNDS = result.parsed.SALTROUNDS
}

const isEmailFormatValid = (email) => {
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return regex.test(email)
}

const isPasswordFormatValid = (email) => {
  const regex = /^.*(?=.{8,})(?=.*\d)(?=.*[a-z]).*$/
  return regex.test(email)
}

const userController = {
  register: async (req, res) => {
    const { nickname, email, password } = req.body
    if (!nickname || !email || !password) throw MissingError
    if (!isEmailFormatValid(email)) throw new GeneralError('信箱格式錯誤')
    if (!isPasswordFormatValid(password)) {
      throw new GeneralError(
        '密碼格式錯誤，長度需為 8 以上並包含小寫英文字母、數字'
      )
    }
    const hash = await bcrypt.hash(password, Number(SALTROUNDS))
    const token = await emailToJwtToken(email)
    await User.create({
      nickname,
      email,
      password: hash,
      userToken: token
    })

    return res.status(200).json({
      ok: 1,
      token,
      statusCode: 200
    })
  },
  login: async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) throw MissingError
    const user = await User.findOne({
      where: {
        email,
        isDeleted: 0
      }
    })
    if (!user) throw VerifyError
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw VerifyError

    return res.status(200).json({
      ok: 1,
      token: user.userToken,
      statusCode: 200
    })
  },
  getOneProfile: async (req, res) => {
    const id = res.locals.id
    const user = await User.findOne({
      attributes: ['id', 'nickname', 'email'],
      where: {
        id,
        isDeleted: 0
      }
    })
    if (!user) throw new NotFound('找不到使用者')

    return res.status(200).json({
      ok: 1,
      user,
      statusCode: 200
    })
  },
  editProfile: async (req, res) => {
    const id = res.locals.id
    const { nickname, email } = req.body
    if (!nickname || !email) throw MissingError
    if (!isEmailFormatValid(email)) throw new GeneralError('信箱格式錯誤')
    const newToken = await emailToJwtToken(email)
    const updatedResult = await User.update(
      {
        nickname,
        email,
        token: newToken
      },
      {
        where: {
          id,
          isDeleted: 0
        }
      }
    )
    if (!updatedResult[0]) throw new GeneralError('更新失敗，請再試一次')

    return res.status(200).json({
      ok: 1,
      message: '個人資訊更新成功',
      token: newToken,
      statusCode: 200
    })
  },
  updatePassword: async (req, res) => {
    const { oldPassword, newPassword, againPassword } = req.body
    if (!oldPassword || !newPassword || !againPassword) throw MissingError
    if (!isPasswordFormatValid(oldPassword)) {
      throw new GeneralError(
        '密碼格式錯誤，長度需為 8 以上並包含小寫英文字母、數字'
      )
    }
    const id = res.locals.id
    const user = await User.findOne({
      where: {
        id,
        isDeleted: 0
      }
    })
    if (!user) throw new NotFound('找不到使用者')
    const passwordIsValid = await bcrypt.compare(oldPassword, user.password)
    if (!passwordIsValid) throw new GeneralError('密碼錯誤，請再次確認')
    if (!isPasswordFormatValid(newPassword)) {
      throw new GeneralError(
        '密碼格式錯誤，長度需為 8 以上並包含小寫英文字母、數字'
      )
    }
    if (newPassword !== againPassword) {
      throw new GeneralError('兩次密碼輸入不一致')
    }
    const hash = await bcrypt.hash(newPassword, Number(SALTROUNDS))
    const updatedResult = await User.update(
      {
        password: hash
      },
      {
        where: {
          id,
          isDeleted: 0
        }
      }
    )
    if (!updatedResult[0]) throw new GeneralError('更新失敗，請再試一次')

    return res.status(200).json({
      ok: 1,
      message: '密碼更新成功',
      statusCode: 200
    })
  },
  delete: async (req, res) => {
    const id = res.locals.id
    const deletedResult = await User.update(
      {
        isDeleted: 1
      },
      {
        where: {
          id,
          isDeleted: 0
        }
      }
    )
    if (!deletedResult[0]) throw new GeneralError('刪除失敗，請再試一次')

    return res.status(200).json({
      ok: 1,
      message: '刪除成功',
      statusCode: 200
    })
  }
}

module.exports = userController
