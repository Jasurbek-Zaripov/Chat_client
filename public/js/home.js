let allUser = document.querySelector(
  'body > div > div > div.col-sm-4.side > div.side-one > div.row.heading > div.col-sm-2.col-xs-2.heading-compose.pull-right > i'
)
const headerImg = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.heading > div.col-sm-2.col-md-1.col-xs-3.heading-avatar > div > img'
)
const headerName = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.heading > div.col-sm-8.col-xs-7.heading-name > a'
)
const headerOnline = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.heading > div.col-sm-8.col-xs-7.heading-name > span'
)
const sendBtn = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.reply > div.col-sm-1.col-xs-1.reply-send > i'
)
async function REF_token() {
  let ref = localStorage.getItem('ref')
  if (!ref) {
    alert('token yuq!')
    location = '/login'
    return
  }
  let res = await fetch(host + '/auth/refresh?ref=' + ref)

  res = await res.json()

  if (res['ERROR']) {
    alert(res['ERROR'] + '\nref!')
    localStorage.removeItem('access_token')
    location = '/login'
    return
  }

  localStorage.setItem('access_token', res['objToken']['access_token'])
  localStorage.setItem('ref', res['objToken']['refresh_token'])
  localStorage.setItem('id', res['id'])
}

allUser.onclick = alluserFun

async function alluserFun() {
  let tkn = localStorage.getItem('access_token')
  if (!tkn) return alert('token yuq!')

  let res = await fetch(host + '/private/users', {
    method: 'GET',
    headers: {
      access_token: tkn,
    },
  })

  res = await res.json()

  if (res['ERROR']) {
    if (res['ERROR'].includes('jwt expired')) {
      await REF_token()
      await alluserFun()
      return
    }
    return alert(res['ERROR'])
  }
  renderAllUser(res)
}
let dashboardAllUser = document.querySelector(
  'body > div > div > div.col-sm-4.side > div.side-two > div.row.compose-sideBar'
)

function renderAllUser(data) {
  dashboardAllUser.innerHTML = null

  for (const userId in data) {
    if (Object.hasOwnProperty.call(data, userId)) {
      if (userId == localStorage.getItem('id')) continue
      const { createTime, myColor, photo, username, isActive, messages } =
        data[userId]

      let div = document.createElement('div')
      div.className = 'row sideBar-body'
      div.id = userId
      div.style.backgroundColor = '#' + myColor

      div.onclick = () => {
        headerImg.src = host + photo
        headerName.innerHTML = username
        headerOnline.innerHTML = isActive ? 'online' : 'offline'
        sendBtn.id = userId
        renderSingleUserMessage(messages, userId)
      }

      div.innerHTML = `
      <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
          <img src="${host + photo}">
        </div>
      </div>

      <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
          <div class="col-sm-8 col-xs-8 sideBar-name">
            <span class="name-meta"> ${username} </span>
          </div>
          <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
          <span class="time-meta pull-right">${createTime}</span>
          </div>
        </div>
      </div>`

      dashboardAllUser.append(div)
    }
  }
}

function renderSingleUserMessage(msg_, onId) {
  let filtMsg = msg_.filter(
    elem => elem.toUserid == localStorage.getItem('id') || elem.toMe == onId
  )
  const dashboarMessage = document.querySelector('#conversation')
  dashboarMessage.innerHTML = null

  filtMsg.map(el => {
    if (el.type) {
      let { id, toUserid, msg, pathFile, type, originalname, time, toMe } = el
      let dsa = createMessageItem(id, toUserid, msg, time, toMe)
      dsa.append(createMessageWithFile(pathFile, type, originalname))
      dashboarMessage.append(dsa)
    } else {
      let { id, toUserid, msg, time, toMe } = el
      let dsa = createMessageItem(id, toUserid, msg, time, toMe)
      dashboarMessage.append(dsa)
    }
  })
}

function createMessageItem(id, toUserid, msg, time, toMe) {
  let div = document.createElement('div')
  div.id = id
  div.className = 'row message-body'
  div.innerHTML = `
  <div class="col-sm-12 message-main-${toMe ? 'receiver' : 'sender'}">
    <div class="${toMe ? 'receiver' : 'sender'}">
      <div class="message-text">${msg}</div>
      <span class="message-time pull-right">${time}</span>
    </div>
  </div>
  `
}

function createMessageWithFile(pathFile, type, originalname) {
  let div = document.createElement('div')
  let p = document.createElement('p')
  let tx = type.split('/')[0] == 'image' ? 'img' : type.split('/')[0]
  div.className = 'messageWithFile'

  p.innerHTML = originalname
  let file = document.createElement(tx)
  file.src = host + pathFile

  div.append(p, file)
  return div
}

let Emoji = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.reply > div.col-sm-1.col-xs-1.reply-emojis > i'
)
let sendMessageInp = document.querySelector('#comment')
let sendAudio = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.reply > div.col-sm-1.col-xs-1.reply-recording > i'
)

Emoji.onclick = () => {
  sendMessageInp.innerHTML += '&#128514;'
}

sendBtn.onclick = sendBtnFun

async function sendBtnFun() {
  try {
    let fd = new FormData()

    fd.append('any', '')
    fd.append('toUserid', sendBtn.id)
    fd.append('msg', sendMessageInp.innerHTML)

    let tkn = localStorage.getItem('access_token')

    if (!tkn) return alert('token yuq!')

    let res = await fetch(host + '/private/msg', {
      method: 'PUT',
      headers: {
        access_token: tkn,
      },
      body: fd,
    })

    res = await res.json()

    if (res['ERROR']) {
      if (res['ERROR'].includes('jwt expired')) {
        await REF_token()
        await sendBtnFun()
        return
      }
      return alert(res['ERROR'])
    }
    //valid date
    //
  } catch (xato) {
    console['log'](xato)
  }
}
