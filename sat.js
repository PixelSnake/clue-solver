/*
const expressions = [
  { implies: ['A', 'B'], },
  { implies: ['C', 'D'], },
  { implies: ['D', 'A'], },
]
const config = {
  A: null,
  B: null,
  C: null,
  D: true,
}
*/

const operators = {
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    implies: (a, b) => !a || (a && b),
    equals: (a, b) => a == b,
}

/*
const res = solve(expressions, config)
console.log(formatSolvedMultiple(res, config))
*/

function formatSolvedMultiple(ress, config) {
    const finalResult = {}

    ress.forEach(res => {
        Object.keys(config).forEach(k => {
            const resV = res[k]
            if (finalResult[k] !== undefined && resV != finalResult[k]) {
                finalResult[k] = '?'
            } else {
                finalResult[k] = resV
            }
        })
    })

    return finalResult
}

function solve(exps, config) {
    config = { ...config }
    exps = [...exps]

    const results = []
    const possible = prefilter(exps, config, results)
    if (!possible) return []

    console.log('Solving this set of formulas should THEORETICALLY be POSSIBLE')
    console.log('Solving starts with the following configuration:')
    console.log(config, exps)
    console.log('\n\n')

    solveInternal(exps, config, results)

    console.log(results.length, 'results')

    return results
}

// exps is an array of expressions
function solveInternal(exps, config, results) {
    const permKey = Object.keys(config).filter(k => config[k] === null)[0]
    if (!permKey) {
        const ress = exps.map(exp => check(exp, config))
        if (ress.filter(r => !r).length === 0) results.push(config)
        return
    }

    let _config = { ...config, [permKey]: true, }
    solveInternal(exps, _config, results)

    _config = { ...config, [permKey]: false, }
    solveInternal(exps, _config, results)
}

// returns false if there cant be a solution, true otherwise
// may alter exps and config
function prefilter(exps, config, results) {
    const expsCopy = [...exps]

    for (let i in expsCopy) {
        const exp = expsCopy[i]
        const match = typeof exp === 'string' && exp.match(/^(!?)([a-zA-Z0-9_]+)$/)
        if (match) {
            const confValue = config[match[2]]
            let defValue = match[1] !== '!'
            if (confValue !== null && defValue != confValue) return false
            config[match[2]] = defValue
            exps.splice(exps.indexOf(exp), 1)
        }
    }

    const usedVars = listUsedVariables(expsCopy, config)
    for (let v in config) {
        if (!usedVars.includes(v) && config[v] === null) {
            console.log(`${v} removed`)
            delete config[v]
        }
    }

    return true
}

function check(exp, config) {
    switch (typeof exp) {
        case 'string':
            let negate = false
            if (exp.startsWith('!')) {
                negate = true
                exp = exp.substr(1)
            }
            if (config[exp] === undefined) throw new Error(`Unknown symbol ${exp}`)
            return negate ? !config[exp] : config[exp];

        case 'object':
            if (Object.keys(exp).length != 1) throw new Error('Expression must have exactly one operator')

            const op = Object.keys(exp)[0]
            const a = check(exp[op][0], config)
            const b = check(exp[op][1], config)
            return operators[op](a, b)
    }
}

function listUsedVariables(exps, config) {
    const results = []
    exps.forEach(exp => listUsedVariablesInternal(exp, config, results))
    return results
}

function listUsedVariablesInternal(exp, config, results) {
    switch (typeof exp) {
        case 'string':
            if (exp.startsWith('!')) exp = exp.substr(1)
            if (config[exp] === undefined) throw new Error(`Unknown symbol ${exp}`)
            results.push(exp)
            return

        case 'object':
            if (Object.keys(exp).length != 1) throw new Error('Expression must have exactly one operator')
            const op = Object.keys(exp)[0]
            listUsedVariablesInternal(exp[op][0], config, results)
            listUsedVariablesInternal(exp[op][1], config, results)
    }
}

module.exports = {
    formatSolvedMultiple,
    solve,
    check,
}