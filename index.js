const actions = require('./actions')
const interaction = require('./interaction')

const variables = []

const actionTracker = new actions.ActionTracker()
actionTracker.loadGame('original.txt')

let exprFormulas = []
init()
// console.log('variables', variables)
// console.log('exprFormulas', exprFormulas)
// console.log('==========================================')

// exprFormulas = exprFormulas.concat(...actionTracker.getFormulas())

interaction.run(actionTracker, exprFormulas, variables).then(() => process.exit(0))

// console.log('====== TRYING TO SOLVE =====')
// console.log('exprFormulas', exprFormulas)

function init() {
    actionTracker.subjects.forEach((c, cI) => {
        c.forEach((s, sI) => {
            const varName = `_${cI}_${sI}`

            variables.push('S' + varName)
            if (actionTracker.actorsSubjects.includes(s)) {
                exprFormulas.push(`!S${varName}`)
            }

            actionTracker.actors.filter(a => a !== actionTracker.actor).forEach(a => {
                variables.push(`${a}_${cI}_${sI}`)
                if (actionTracker.actorsSubjects.includes(s)) exprFormulas.push(`!${a}${varName}`)
            })
        })

        // add expressions for "if its none of the other actions, the remaining one hase to be the solution"
        for (let si = 0; si < c.length; si++) {
            const cCopy = [...c]
            cCopy.splice(si, 1)
            const exclusionRule = cCopy.map(s => `!${actionTracker.keyForSubject(s)}`).join(' & ') + ` => S_${cI}_${si}`
            exprFormulas.push(exclusionRule)
        }
    })
}
