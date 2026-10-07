import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputPath = resolve('dist/index.html')
const rootPattern = /<div id="root">\s*<\/div>/
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
})

try {
  const { App } = await vite.ssrLoadModule('/src/main.tsx')
  const markup = renderToString(createElement(App))
  const html = await readFile(outputPath, 'utf8')

  if (!rootPattern.test(html)) {
    throw new Error('Could not find the empty React root in dist/index.html')
  }

  await writeFile(outputPath, html.replace(rootPattern, `<div id="root">${markup}</div>`))
  console.log('Prerendered TunePrint into dist/index.html')
} finally {
  await vite.close()
}
