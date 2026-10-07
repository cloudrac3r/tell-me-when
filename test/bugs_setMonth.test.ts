import { test } from 'supertape'
import { tellMeWhen } from '../src'

test(`bugs: setMonth from 6/29/2026 to 2/1/2021`, t => {
  t.deepEqual(
    tellMeWhen('Feb 2021', {
      locales: ['en-US'],
      now: new Date('2026-06-29 12:34 am'),
    }),
    [
      new Date('2021-02-01 00:00:00.000'),
      new Date('2021-03-01 00:00:00.000'),
    ]
  )
})
