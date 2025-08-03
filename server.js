import express from 'express'
import fs from 'node:fs/promises'

const isProduction = process.env.NODE_ENV === 'production'
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

const app = express()


// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.get('*all', async (req, res) => {
  const url = req.originalUrl.replace(base, '')

  /** @type {string} */
  let template
  /** @type {import('./src/entry-server.ts').render} */
  let render
  if (!isProduction) {
    // Always read fresh template in development
    template = await fs.readFile('./index.html', 'utf-8')
    template = await vite.transformIndexHtml(url, template)
    render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
  } else {
    template = templateHtml
    render = (await import('./dist/server/entry-server.js')).render
  }

  const rendered = await render({ req, res, head: req.headers })
  res.status(200).set({ 'Content-Type': 'text/html' }).send(await rendered.text())
})

const listener = app.listen(3000, () => {
  let { port } = listener.address();
  console.log(`Listening on port ${port}`);
});