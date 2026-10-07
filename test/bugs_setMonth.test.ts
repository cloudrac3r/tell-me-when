import { test } from 'supertape'
import { tellMeWhen, parse } from '../src'

test(`bugs: setMonth from 6/29/2026 to 2/1/2021`, t => {
  t.deepEqual(
    tellMeWhen('Feb 2021', {
      locales: ['en-US'],
      now: Temporal.PlainDateTime.from('2026-06-29 12:34').toZonedDateTime("America/Juneau"),
    }).toString(),
    '2021-02-01T00:00:00-09:00[America/Juneau]'
  )
})
