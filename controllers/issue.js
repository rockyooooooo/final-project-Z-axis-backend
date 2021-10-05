const db = require('../models')
const { Issue, Comment } = db
const { MissingError, GeneralError, NotFound } = require('../middlewares/error')
const { encrypt, decrypt } = require('../utils/crypto')

const issueController = {
  add: async (req, res) => {
    const userId = res.locals.id
    const { title, description, beginTime, finishTime } = req.body
    // description allow null value
    if (!title || !beginTime || !finishTime) throw MissingError
    const issue = await Issue.create({
      title,
      description,
      beginTime,
      finishTime,
      UserId: Number(userId)
    })
    if (!issue) throw new GeneralError('新增失敗')
    // encrypt: issueId => issueRUL
    const issueId = issue.id.toString()
    const encoded = encrypt(issueId)

    res.status(200).json({
      ok: 1,
      message: '新增成功',
      url: encoded,
      issue
    })
  },

  delete: async (req, res) => {
    const userId = res.locals.id
    const { issueId } = req.params
    const deletedResult = await Issue.update(
      {
        isDeleted: 1
      },
      {
        where: {
          UserId: userId,
          id: Number(issueId),
          isDeleted: 0
        }
      }
    )
    if (!deletedResult[0]) throw new GeneralError('刪除失敗，請再試一次')
    res.status(200).json({
      ok: 1,
      message: '刪除成功'
    })
  },

  patch: async (req, res) => {
    const userId = res.locals.id
    const { title, description, beginTime, finishTime } = req.body
    // description allow null value
    if (!title || !beginTime || !finishTime) throw MissingError
    const { issueId } = req.params
    const updatedResult = await Issue.update(
      {
        title,
        description,
        beginTime,
        finishTime
      },
      {
        where: {
          UserId: userId,
          id: Number(issueId),
          isDeleted: 0
        }
      }
    )
    if (!updatedResult[0]) throw new GeneralError('更新失敗，請再試一次')
    res.status(200).json({
      ok: 1,
      message: '更新成功'
    })
  },

  getAll: async (req, res) => {
    const userId = res.locals.id
    const issues = await Issue.findAll({
      where: {
        userId,
        isDeleted: 0
      }
    })

    const issuesWithURL = issues.map((issue) => {
      const url = encrypt(issue.id.toString())
      return { issue, url }
    })

    res.status(200).json({
      ok: 1,
      issuesWithURL
    })
  },

  getOne: async (req, res) => {
    const { issueURL } = req.params
    const issueId = decrypt(issueURL)
    const issue = await Issue.findOne({
      where: {
        id: Number(issueId),
        isDeleted: 0
      }
    })
    if (!issue) throw new NotFound('找不到這個提問箱')
    res.status(200).json({
      ok: 1,
      issue
    })
  },
  pinCommentOnTop: async (req, res) => {
    const { issueId } = req.params
    const { commentId } = req.body

    const comment = await Comment.findOne({
      where: {
        id: Number(commentId),
        IssueId: Number(issueId)
      }
    })
    if (!comment) throw new NotFound('找不到此留言')

    await Issue.update(
      {
        topCommentId: comment.id
      },
      {
        where: {
          id: Number(issueId),
          isDeleted: 0
        }
      }
    )

    res.status(200).json({
      ok: 1,
      message: '置頂成功',
      comment
    })
  },
  unpinCommentOnTop: async (req, res) => {
    const { issueId } = req.params

    await Issue.update(
      {
        topCommentId: 0
      },
      {
        where: {
          id: Number(issueId),
          isDeleted: 0
        }
      }
    )
    res.status(200).json({
      ok: 1,
      message: '取消置頂成功'
    })
  }
}

module.exports = issueController
