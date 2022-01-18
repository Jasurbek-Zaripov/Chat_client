import express from 'express'
import { join } from 'path'
const app = express()
const PORT = process.env.PORT || 9080
app.use(express.static(join(process.cwd(), 'public')))

app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'index.html'))
})

app.get('/:file', (req, res) => {
  try {
    if (['login', 'register'].includes(req.params.file)) {
      return res.sendFile(join(process.cwd(), req.params.file + '.html'))
    }
    throw new Error('Not Found!')
  } catch (xato) {
    return res.status(404).json({ Error: xato.message })
  }
})

app.listen(PORT, () => console['log']('client: http://192.168.1.144:' + PORT))
