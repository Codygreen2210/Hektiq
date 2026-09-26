// One-time script: makes every page use the shared community colors
// from lib/communities.ts instead of its own copy.
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const LIB = path.join(ROOT, 'lib', 'communities')
const folders = ['app', 'components']

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const s = fs.statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts)$/.test(name)) out.push(p)
  }
  return out
}

// Removes "const NAME: Record<string, string> = { ... }" from the text
function removeBlock(text, name) {
  const start = text.indexOf('const ' + name + ': Record<string, string> = {')
  if (start === -1) return { text, found: false }
  const end = text.indexOf('\n}', start)
  if (end === -1) return { text, found: false }
  let after = end + 2
  while (text[after] === '\n') after++
  return { text: text.slice(0, start) + text.slice(after), found: true }
}

// Adds a name to the import from lib/communities, or adds a new import line
function addImport(text, file, name) {
  let rel = path.relative(path.dirname(file), LIB).split(path.sep).join('/')
  if (!rel.startsWith('.')) rel = './' + rel

  const re = /import \{([^}]*)\} from '([^']*lib\/communities)'/
  const m = text.match(re)
  if (m) {
    const names = m[1].split(',').map(s => s.trim()).filter(Boolean)
    if (names.includes(name)) return text
    names.push(name)
    return text.replace(re, "import { " + names.join(', ') + " } from '" + m[2] + "'")
  }

  const lines = text.split('\n')
  let lastImport = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i
  }
  const line = "import { " + name + " } from '" + rel + "'"
  if (lastImport === -1) {
    const first = lines[0].startsWith("'use client'") ? 1 : 0
    lines.splice(first, 0, line)
  } else {
    lines.splice(lastImport + 1, 0, line)
  }
  return lines.join('\n')
}

const changed = []
for (const folder of folders) {
  const dir = path.join(ROOT, folder)
  if (!fs.existsSync(dir)) continue
  for (const file of walk(dir)) {
    let text = fs.readFileSync(file, 'utf8')
    const original = text

    for (const name of ['COLOR', 'COLORS']) {
      const r = removeBlock(text, name)
      if (r.found) {
        text = addImport(r.text, file, name)
      }
    }

    if (text !== original) {
      fs.writeFileSync(file, text)
      changed.push(path.relative(ROOT, file))
    }
  }
}

console.log(changed.length ? 'Updated ' + changed.length + ' files:\n  ' + changed.join('\n  ') : 'No files needed changes.')