import { tellMeWhen, ParseError } from './index'

const expr = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('--'))
  .join(' ')

const iso = process.argv.includes('--iso')

let result: Temporal.ZonedDateTime | [Temporal.ZonedDateTime, Temporal.ZonedDateTime]
try {
  result = tellMeWhen(expr)
} catch (error) {
  if (error instanceof ParseError) {
    // eslint-disable-next-line no-console
    console.error(expr)
    // eslint-disable-next-line no-console
    console.error(
      `${' '.repeat(error.from)}${'^'.repeat(
        Math.max(1, error.to - error.from)
      )} parse error`
    )
  }
  process.exit(1)
}

const formatDate = iso
  ? (d: Temporal.ZonedDateTime) => d.toString()
  : (d: Temporal.ZonedDateTime) => d.toLocaleString()

// eslint-disable-next-line no-console
console.log(
  Array.isArray(result)
    ? result.map(formatDate).join(' to ')
    : formatDate(result)
)
