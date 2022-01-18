const allUser = document.querySelector(
  'body > div > div > div.col-sm-4.side > div.side-one > div.row.heading > div.col-sm-2.col-xs-2.heading-compose.pull-right > i'
)
const MyAvatarImg = document.querySelector(
  'body > div > div > div.col-sm-4.side > div.side-one > div.row.heading > div.col-sm-3.col-xs-3.heading-avatar > div > img'
)
const MyAllUser = document.querySelector(
  'body > div > div > div.col-sm-4.side > div.side-one > div.row.sideBar'
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
alluserFun()

setTimeout(async function recursive() {
  let tkn = localStorage.getItem('access_token')
  if (!tkn) {
    alert('token yuq!')
    location = '/login'
    return
  }

  let res = await fetch(host + '/private/change', {
    method: 'GET',
    headers: {
      access_token: tkn,
    },
  })

  res = await res.json()

  if (res['ERROR']) {
    if (res['ERROR'].includes('jwt expired')) {
      await REF_token()
      await recursive()
      return
    }
    return alert(res['ERROR'])
  }

  if (res['yes']) {
    await alluserFun()
  }
  setTimeout(recursive, 100)
}, 100)

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
  MyAllUser.innerHTML = null

  for (const userId in data) {
    if (Object.hasOwnProperty.call(data, userId)) {
      const { createTime, myColor, photo, username, isActive, messages } =
        data[userId]

      if (userId == localStorage.getItem('id')) {
        MyAvatarImg.src = host + photo
        continue
      }

      let div = document.createElement('div')
      div.className = 'row sideBar-body'
      div.id = userId
      div.style.backgroundColor = myColor

      div.onclick = () => {
        headerImg.src = host + photo
        headerName.innerHTML = username
        headerOnline.innerHTML = isActive ? 'online' : 'offline'
        sendBtn.id = userId
        document.title = username
        localStorage.setItem(
          'U',
          JSON.stringify({ src: host + photo, username, userId })
        )
        renderSingleUserMessage(messages)
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

      if (
        data[localStorage.getItem('id')]['messages'].find(
          ({ toUserid, toMe }) => toUserid == userId || toMe == userId
        )
      ) {
        let qwe = div.cloneNode(true)
        qwe.onclick = () => {
          headerImg.src = host + photo
          headerName.innerHTML = username
          headerOnline.innerHTML = isActive ? 'online' : 'offline'
          sendBtn.id = userId
          document.title = username
          localStorage.setItem(
            'U',
            JSON.stringify({ src: host + photo, username, userId })
          )
          renderSingleUserMessage(messages)
        }
        MyAllUser.append(qwe)
      }
      dashboardAllUser.append(div)
    }
  }
  let U_local = localStorage.getItem('U')
  if (U_local) {
    U_local = JSON.parse(U_local)
    headerImg.src = U_local.src
    headerName.innerHTML = U_local.username
    sendBtn.id = U_local.userId
    document.title = U_local.username
    renderSingleUserMessage(data[U_local.userId]['messages'])
  }
}

function renderSingleUserMessage(msg_) {
  let myUserId = localStorage.getItem('id')

  let filtMsg = msg_.filter(
    elem => elem.toUserid == myUserId || elem.toMe == myUserId
  )

  const dashboarMessage = document.querySelector('#conversation')
  dashboarMessage.innerHTML = null

  filtMsg.map(el => {
    if (el.type) {
      let {
        id,
        toUserid,
        msg,
        pathFile,
        type,
        originalname,
        time,
        toMe,
        size,
      } = el
      let dsa = createMessageItem(id, toUserid, msg, time, toMe)
      dsa.append(
        createMessageWithFile(pathFile, type, originalname, toMe, time, size)
      )
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
  <div class="col-sm-12 message-main-${toMe ? 'sender' : 'receiver'}">
    <div class="${toMe ? 'sender' : 'receiver'}">
      <div class="message-text">${msg}</div>
      <span class="message-time pull-right">${time}</span>
    </div>
  </div>
  `
  return div
}

function createMessageWithFile(pathFile, type, originalname, toMe, time, size) {
  let div = document.createElement('div')
  let p = document.createElement('p')
  let span = document.createElement('span')
  if (originalname == 'blob') originalname = time
  let tx = type.split('/')[0] == 'image' ? 'img' : type.split('/')[0]
  div.className = `${toMe ? 'sender fileRight' : 'receiver fileLeft'}`

  p.innerHTML = originalname
  span.innerHTML = size + ' mb'
  let file = document.createElement(tx)
  file.src = host + pathFile
  file.setAttribute('controls', '')

  div.append(p, file, span)
  return div
}

let Emoji = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.reply > div.col-sm-1.col-xs-1.reply-emojis > i'
)
let sendMessageInp = document.querySelector('#comment')

//\f114 file

Emoji.onclick = () => {
  sendMessageInp.innerHTML = '&#128514;'
  sendMessageInp.value += sendMessageInp.innerHTML
  sendMessageInp.innerHTML = null
}
let SendAnyFile = document.querySelector('#fileElem')
sendBtn.onclick = sendBtnFun

async function sendBtnFun() {
  try {
    let fd = new FormData()
    fd.append('any', blob || SendAnyFile.files[0] || '')
    fd.append('toUserid', sendBtn.id)
    fd.append('msg', sendMessageInp.value)

    let tkn = localStorage.getItem('access_token')

    if (!tkn) return alert('token yuq!')
    sendMessageInp.value = 'Junatilmoqda kuting...'
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
    sendMessageInp.value = 'muvaffaqiyatli Junatildi!'
    sendMessageInp.style.color = 'red'
    setTimeout(() => {
      sendMessageInp.innerHTML = null
      sendMessageInp.value = null
      sendMessageInp.style.color = 'black'
    }, 1000)
    sendAudio.innerHTML = null
    blob = null
  } catch (xato) {
    console['log'](xato)
  }
}
