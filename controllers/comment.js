const db = require('../models')
const { Comment, Issue, GuestsCommentsRelation } = db
const { MissingError, GeneralError, NotFound } = require('../middlewares/error')

const commentController = {
  addComment: async (req, res) => {
    const nickname = req.body.nickname || 'Anonymous'
    const content = req.body.content
    const guestToken = req.headers['guest-token']
    const { issueId } = req.params
    if (!content) throw MissingError

    const comment = await Comment.create({
      nickname,
      content,
      IssueId: Number(issueId),
      guestToken
    })
    if (!comment) throw new GeneralError('新增留言失敗！')

    res.status(200).json({
      ok: 1,
      message: '新增留言成功！',
      comment
    })
  },
  deleteComment: async (req, res) => {
    const { commentId } = req.params

    const response = await Comment.destroy({
      where: {
        id: Number(commentId)
      }
    })
    if (!response) throw new GeneralError('刪除留言失敗！')

    res.status(200).json({
      ok: 1,
      message: '刪除留言成功！'
    })
  },
  editComment: async (req, res) => {
    const { nickname, content } = req.body
    const { commentId } = req.params
    if (!content) throw MissingError

    const comment = await Comment.update(
      {
        nickname,
        content
      },
      {
        where: {
          id: Number(commentId)
        }
      }
    )
    if (!comment[0]) throw new GeneralError('編輯留言失敗！')

    res.status(200).json({
      ok: 1,
      message: '編輯留言成功！'
    })
  },
  editReply: async (req, res) => {
    const { reply } = req.body
    const { commentId } = req.params

    const response = await Comment.update(
      {
        reply,
        replyCreateAt: new Date()
      },
      {
        where: {
          id: Number(commentId)
        }
      }
    )
    if (!response) throw new GeneralError('編輯回覆失敗！')

    res.status(200).json({
      ok: 1,
      message: '編輯回覆成功！'
    })
  },
  getAllComments: async (req, res) => {
    const { issueId } = req.params

    const issue = await Issue.findOne({
      where: {
        id: Number(issueId)
      }
    })

    if (!issue) throw new NotFound('找不到提問箱')

    const comments = await Comment.findAll({
      where: {
        IssueId: Number(issueId)
      }
    })

    res.status(200).json({
      ok: 1,
      comments
    })
  },
  likesComment: async (req, res) => {
    const userId = res.locals.id
    const guestToken = res.locals.guestToken
    const { commentId } = req.params

    const comment = await Comment.findOne({
      where: {
        id: Number(commentId)
      }
    })

    const { likesNum } = comment

    if (userId) {
      const compareLiked = await GuestsCommentsRelation.findOne({
        where: {
          userId,
          commentId
        }
      })
      if (!compareLiked) {
        await GuestsCommentsRelation.create({
          UserId: Number(userId),
          guestToken,
          commentId
        })

        await Comment.update(
          {
            likesNum: Number(likesNum) + 1
          },
          {
            where: {
              id: Number(commentId)
            }
          }
        )
        res.status(200).json({
          ok: 1,
          message: '登入者按讚成功！'
        })
      } else {
        await GuestsCommentsRelation.destroy({
          where: {
            userId,
            commentId
          }
        })
        await Comment.update(
          {
            likesNum: Number(likesNum) - 1
          },
          {
            where: {
              id: Number(commentId)
            }
          }
        )
        res.status(200).json({
          ok: 1,
          message: '登入者收回讚成功！'
        })
      }
    } else if (guestToken) {
      const compareLiked = await GuestsCommentsRelation.findOne({
        where: {
          guestToken,
          commentId
        }
      })
      if (!compareLiked) {
        await GuestsCommentsRelation.create({
          UserId: null,
          guestToken,
          commentId
        })

        await Comment.update(
          {
            likesNum: Number(likesNum) + 1
          },
          {
            where: {
              id: Number(commentId)
            }
          }
        )
        res.status(200).json({
          ok: 1,
          message: '訪客按讚成功！'
        })
      } else {
        await GuestsCommentsRelation.destroy({
          where: {
            guestToken,
            commentId
          }
        })
        await Comment.update(
          {
            likesNum: Number(likesNum) - 1
          },
          {
            where: {
              id: Number(commentId)
            }
          }
        )
        res.status(200).json({
          ok: 1,
          message: '訪客收回讚成功！'
        })
      }
    }
  },
  commentOnTop: async (req, res) => {
    const { issueId, commentId } = req.params

    const response = await Issue.update(
      {
        topCommentId: Number(commentId)
      },
      {
        where: {
          id: Number(issueId),
          isDeleted: 0
        }
      }
    )
    console.log(response)
    if (!response[0]) throw new GeneralError('置頂失敗！')

    res.status(200).json({
      ok: 1,
      message: '置頂成功！'
    })
  }
}

module.exports = commentController
