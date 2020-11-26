const sat = require('./sat')

function trySolve(exprFormulas, variables, actionTracker) {
    const config = { 'true': true, 'false': false }
    variables.forEach(v => config[v] = null)

    const exps = exprFormulas.map(formulaToExpression)
    const solved = sat.solve(exps, config)
    const solvedJson = sat.formatSolvedMultiple(solved, config)

    // add definite values to the set of rules
    for (var v in solvedJson) {
        if (v === 'true' || v === 'false') continue;
        switch (solvedJson[v]) {
            case true:
                if (!exprFormulas.includes(v)) {
                    exprFormulas.push(v)
                    console.log(`Permanently fixed the value of ${v} to ${solvedJson[v]}`)
                }
                break;

            case false:
                if (!exprFormulas.includes(`!${v}`)) {
                    exprFormulas.push(v)
                    console.log(`Permanently fixed the value of ${v} to ${solvedJson[v]}`)
                }
                break;
        }

        if (v.startsWith('S_') && solvedJson[v] === true) {
            const [, a, b] = v.split('_')
            const subject = actionTracker.subjects[parseInt(a)][parseInt(b)]
            console.log(subject + ' is part of the solution')
        }
    }
}

function formulaToExpression(formula) {
    const ops = {
        '<=>': 'equals',
        '=>': 'implies',
        '&': 'and',
        '|': 'or'
    }

    for (const op in ops) {
        const i = formula.indexOf(op)
        if (i < 0) continue

        const res = {
            [ops[op]]: [
                formulaToExpression(formula.substr(0, i)),
                formulaToExpression(formula.substr(i + op.length)),
            ]
        }
        return res
    }

    console.log('formula', formula)
    return formula.trim()
}

module.exports = {
    trySolve
}