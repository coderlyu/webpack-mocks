module.exports = function ({ param: obj }) {
  // console.log(obj)
  // const obj = JSON.parse(options.param)

  let res = { name : '' }
  // console.log('-----', obj.keyword)
  switch (obj.keyword) {
    case '推荐':
      // console.log(obj.keyword)
      res = {
        status: {
          code: 0,
          message: 'OK',
          description: ''
        },
        result: {
          activityList: [
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [
                {
                  data: '每日瓜分红包',
                  name: 'activity_tag', // 活动标
                  color: '#ffffff' //颜色
                }
              ],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [
                {
                  data: '题库更新',
                  name: 'question_update', // 题库更新标
                  color: '#ffffff' //颜色
                }
              ],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂倒计时的发i哦地方i',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [
                {
                  data: '新赛道',
                  name: 'track_add', // 赛道新增标
                  color: '#ffffff' //颜色
                }
              ],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [{}],
              joinStatus: 0
            },
            {
              name: '设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [{}],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [{}],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [{}],
              joinStatus: 0
            },
            {
              name: '萨阿设计大赛看懂',
              tip: '',
              joinNum: 100,
              joiners: [
                {
                  nickName: '',
                  headImage: ''
                }
              ],
              auth: '',
              backgroundColor: '#fff',
              tagList: [{}],
              joinStatus: 0
            }
          ]
        }
      }
      break
    case '影视综艺':

      break
    case '韩国综艺':

      break
    default:
      res = {
        status: {
          code: 0,
          message: 'OK',
          description: ''
        }
      }
      break
  }
  return res
}
