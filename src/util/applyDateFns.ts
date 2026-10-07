import { DateFn } from './DateFn'

export function applyDateFns(
  dateFns: DateFn[],
  { now = Temporal.Now.zonedDateTimeISO() }: { now?: Temporal.ZonedDateTime } = {}
): Temporal.ZonedDateTime | [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  function applyDateFn(
    z: Temporal.ZonedDateTime | [Temporal.ZonedDateTime, Temporal.ZonedDateTime],
    next: DateFn
  ): Temporal.ZonedDateTime | [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
    if (Array.isArray(z)) {
      throw new Error(`can't apply a DateFn after makeInterval`)
    }
    switch (next[0]) {
      case 'now':
        return now
      case 'setYear':
        return z.with({year: next[1]})
      case 'setMonth':
        // parser gives 0-indexed months but Temporal uses 1-indexed
        return z.with({month: next[1] + 1, day: next[2]})
      case 'setDate':
        return z.with({day: next[1]})
      case 'setDay':
        return z.add({days: next[1] - z.dayOfWeek})
      case 'setHours':
        return z.with({hour: next[1]})
      case 'setMinutes':
        return z.with({minute: next[1]})
      case 'setSeconds':
        return z.with({second: next[1]})
      case 'setMilliseconds':
        return z.with({millisecond: next[1]})
      case 'startOfYear':
        z = z.with({month: 1})
      // eslint-disable-next-line no-fallthrough
      case 'startOfMonth':
        z = z.with({day: 1})
      // eslint-disable-next-line no-fallthrough
      case 'startOfDay':
        return z = z.startOfDay()
      case 'startOfHour':
        z = z.with({minute: 0})
      // eslint-disable-next-line no-fallthrough
      case 'startOfMinute':
        z = z.with({second: 0})
      // eslint-disable-next-line no-fallthrough
      case 'startOfSecond':
        z = z.with({millisecond: 0})
        return z
      case 'if':
        const compare = Temporal.ZonedDateTime.compare(z, now)
        if (compare === -1) {
          return next[1].beforeNow?.reduce(applyDateFn, z) || z
        } else if (compare === 1) {
          return next[1].afterNow?.reduce(applyDateFn, z) || z
        } else {
          return z
        }
      case 'closestToNow': {
        const a = next[1].reduce(applyDateFn, z)
        const b = next[2].reduce(applyDateFn, z)
        if (Array.isArray(a) || Array.isArray(b)) {
          throw new Error(`can't use makeInterval inside closestToNow`)
        }
        if (Temporal.Duration.compare(z.since(a).abs(), z.since(b).abs()) < 0) return a
        else return b
      }
      case 'addYears':
        return z.add({years: next[1]})
      case 'addMonths':
        return z.add({months: next[1]})
      case 'addWeeks':
        return z.add({weeks: next[1]})
      case 'addDays':
        return z.add({days: next[1]})
      case 'addHours':
        return z.add({hours: next[1]})
      case 'addMinutes':
        return z.add({minutes: next[1]})
      case 'addSeconds':
        return z.add({seconds: next[1]})
      case 'addMilliseconds':
        return z.add({milliseconds: next[1]})
      case 'makeInterval': {
        const end = (next.slice(1) as DateFn[]).reduce(applyDateFn, z)
        if (Array.isArray(end)) {
          throw new Error(`can't use makeInterval inside makeInterval`)
        }
        if (Temporal.ZonedDateTime.compare(z, end) === 1) {
          throw new Error(
            'expression seems invalid, produced an end date before the start date'
          )
        }
        return [z, end]
      }
    }
    return z
  }

  return dateFns.reduce(applyDateFn, now)
}
