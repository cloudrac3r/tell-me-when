import { test } from 'supertape'
import { parseTestcases } from './parseTestcases'
import { parse } from '../src/index'
import { ParseState } from '../src/util/ParseState'
import { stringifyParseNode } from './stringifyParseNode'
import { getGrammar } from '../src/util/getGrammar'

const Root = getGrammar()
for (const input of Object.keys(parseTestcases)) {
  const value = parseTestcases[input]
  const expected =
    value instanceof Object && 'ref' in value
      ? parseTestcases[value.ref]
      : value
  test(`parse: ${input}${expected === 'error' ? ' (error)' : ''}`, t => {
    const state = new ParseState(input, { flags: 'gi' })
    const tree = Root.parse(state)
    const error = tree.find((n) => n.isError)
    if (error) {
      if (expected === 'error') {
        return t.ok("correctly expected error")
      }
      throw new Error(
        `syntax error\nParse tree: ${stringifyParseNode(input, tree)}`
      )
    }

    try {
      if (expected === 'error') {
        try {
          parse(input)
          t.fail(`expected error but it worked`)
        } catch (e) {
          t.ok(e)
        }
      } else {
        const parsed = parse(input)
        t.deepEqual(parsed, expected)
      }
    } catch (error) {
      if (error instanceof Error) {
        const state = new ParseState(input, { flags: 'gi' })
        const tree = Root.parse(state)
        error.message += `\nParse tree: ${stringifyParseNode(input, tree)}`
      }
      throw error
    }
  })
}
