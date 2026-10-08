import { supportedValues } from '../test/parseTestcases'
import { tellMeWhen } from '../src/index'
import * as fs from 'fs/promises'
import * as path from 'path'
import 'temporal-polyfill-lite/global'

const START_MARKER = '<!-- examplestart -->'
const END_MARKER = '<!-- exampleend -->'

const readmeFile = path.resolve(__dirname, '..', '..', 'README.md')

const nowStr = '2024-01-01 00:00'
const now = Temporal.PlainDateTime.from(nowStr).toZonedDateTime('UTC')

;(async () => {
  const readme = await fs.readFile(readmeFile, 'utf8')
  const startIndex = readme.indexOf(START_MARKER)
  if (startIndex < 0) throw new Error(`failed to find ${START_MARKER}`)
  const endIndex = readme.indexOf(END_MARKER)
  if (endIndex < 0) throw new Error(`failed to find ${END_MARKER}`)
  const formatDate = (date: Temporal.ZonedDateTime) =>
    date.toPlainDateTime().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  const interpret = (expression: string) => {
    const parsed = tellMeWhen(expression, { now })
    return Array.isArray(parsed)
      ? parsed.map(formatDate).join(' - ')
      : formatDate(parsed)
  }
  const replaced = `${readme.substring(0, startIndex + START_MARKER.length)}
| Expression | Interpretation for now = ${formatDate(now)} |
| ---------- | --------- |
${supportedValues.map((v) => `| \`${v}\` | \`${interpret(v)}\` |`).join('\n')}
${readme.substring(endIndex)}`
  const formatted = replaced // prettier.format(replaced, { filepath: readmeFile })
  if (formatted !== readme) {
    await fs.writeFile(readmeFile, formatted, 'utf8')
    // eslint-disable-next-line no-console
    console.error(`wrote ${path.relative(process.cwd(), readmeFile)}`)
  }
})()
