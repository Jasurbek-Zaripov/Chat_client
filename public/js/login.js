let errorDisplay = document.querySelector('#errorMessage')
errorDisplay.innerHTML = null

let Form = document.querySelector(
  '#loginModal > div > div > div.modal-body > form'
)
let Username = document.querySelector(
  '#loginModal > div > div > div.modal-body > form > div:nth-child(1) > input'
)
let Userpassword = document.querySelector(
  '#loginModal > div > div > div.modal-body > form > div:nth-child(2) > input'
)

Form.onsubmit = async eve => {
  try {
    eve.preventDefault()
    let username = Username.value
    let password = Userpassword.value
    let res = await fetch(host + '/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
    res = await res.json()
    if (res['ERROR']) {
      errorDisplay.innerHTML = null
      errorDisplay.innerHTML = res['ERROR']
      return
    }

    localStorage.setItem('access_token', res['objToken']['access_token'])
    localStorage.setItem('ref', res['objToken']['refresh_token'])
    localStorage.setItem('id', res['id'])
    location = '/'
  } catch (xato) {
    console['log'](xato)
  }
}
