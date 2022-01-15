let errorDisplay = document.querySelector('#errorMessage')
errorDisplay.innerHTML = null

let Form = document.querySelector(
  '#loginModal > div > div > div.modal-body > form'
)

Form.onsubmit = async eve => {
  try {
    eve.preventDefault()
    let fd = new FormData(Form)

    let res = await fetch(host + '/auth/register', {
      method: 'POST',
      body: fd,
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
