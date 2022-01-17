// set up basic variables for app

let sendAudio = document.querySelector(
  'body > div > div > div.col-sm-8.conversation > div.row.reply > div.col-sm-1.col-xs-1.reply-recording > i.fa.fa-microphone.fa-2x'
)
let blob
if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.')

  const constraints = { audio: true }
  let chunks = []

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream)
    // for show second---
    let idInterval
    let secondFun = () => {
      let i = 0
      idInterval = setInterval(() => {
        sendAudio.innerHTML = i
        i++
      }, 1000)
    }
    let secondFunDel = () => clearInterval(idInterval)
    //-------------------
    sendAudio.onmousedown = function () {
      sendAudio.style.color = 'red'
      mediaRecorder.start()
      secondFun()
    }

    sendAudio.onmouseup = function () {
      sendAudio.style.color = 'white'
      mediaRecorder.stop()
      secondFunDel()
    }

    mediaRecorder.onstop = function (e) {
      blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
      chunks = []
    }

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data)
    }
  }

  let onError = function (err) {
    console.log('The following error occured: ' + err)
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
} else {
  console.log('getUserMedia not supported on your browser!')
}
