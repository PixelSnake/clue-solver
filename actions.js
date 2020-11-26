const fs = require('fs')

class ActionTracker {
    constructor(actor, actors, subjects, actorsSubjects) {
        this.actor = actor
        this.actors = actors
        this.subjects = subjects
        this.actorsSubjects = actorsSubjects

        this.actions = []
    }

    otherActors() {
        return this.actors.filter(a => a !== this.actor)
    }

    addAction(a) {
        this.actions.push(a)
    }

    getFormulas(action) {
        if (action) return actionToFormulas(action, this)
        return actions.map(a => actionToFormulas(a, this))
    }

    keyForSubject(subj, actor) {
        const prefix = (!actor || actor === this.actor) ? 'S' : actor
        return this.subjects.map((s, i) => [s.indexOf(subj), i]).filter(s => s[0] >= 0).map(s => `${prefix}_${s[1]}_${s[0]}`)[0]
    }

    loadGame(filename) {
        const file = fs.readFileSync(filename).toString()
        const lines = file.split('\n')

        let subjects = []
        let subjectMode = false

        for (let i = 0; i < lines.length; i++) {
            const l = lines[i]
            const firstToken = l.split(' ')[0]

            if (firstToken === 'Subjects') {
                subjectMode = true
                continue
            } else if (firstToken === 'Actors') {
                this.actors = l.substr('Actors'.length).split(',').map(a => a.trim())
                this.actor = this.actors[0]
                continue
            } else if (firstToken === 'Init') {
                this.actorsSubjects = l.substr('Init'.length).split(',').map(s => s.trim())
                continue
            } else if (firstToken === 'End') {
                break
            }

            if (subjectMode) {
                if (l.length < 1) {
                    subjectMode = false
                    this.subjects = subjects
                } else {
                    subjects.push(l.split(',').map(s => s.trim()))
                }
                continue
            }

            if (l.trim().length < 1) continue

            const action = this.loadAction(lines, i)
            if (!action) continue

            this.addAction(action)
            i = action.i
        }

        // console.log(this.actions)
    }

    loadAction(lines, start = 0) {
        let actor, suspicion, evidence = {}

        for (let i = start; i < lines.length; i++) {
            const l = lines[i]
            const firstToken = l.split(' ')[0]

            if (!actor) actor = l
            else if (!suspicion) suspicion = l.split(',').map(s => s.trim())
            else if (l.length > 0) evidence[firstToken] = l.substr(firstToken.length).trim()
            else {
                this.actors.forEach(a => {
                    if (a === actor) return
                    if (!evidence[a]) evidence[a] = null
                })

                return { i, actor, suspicion, evidence }
            }
        }
    }
}

function actionToFormulas(action, tracker) {
    console.log(`${action.actor} suspects: ${action.suspicion} - there is the following evidence:`)
    Object.keys(action.evidence).forEach(e => console.log(`\t${e}: ${action.evidence[e] || 'nothing'}`))

    const formulas = []

    const actorsWithEvidence = Object.keys(action.evidence).filter(a => action.evidence[a] !== null)
    const actorsWithoutEvidence = Object.keys(action.evidence).filter(a => action.evidence[a] === null)
    const subjectsNotPresented = action.suspicion.filter(s => !Object.values(action.evidence).includes(s))
    const countEvidencePresented = actorsWithEvidence.length

    // if not all players present evidence
    if (countEvidencePresented < tracker.actors.length - 1 && action.actor === tracker.actor) {
        console.log('Not all players have presented evidence')

        // the subject not presented must be owned by those who showed evidence, otherwise it is part of the solution
        subjectsNotPresented
            .filter(s => !tracker.actorsSubjects.includes(s))
            .forEach(s => formulas.push(formula_notActorsMeansSolution(s, actorsWithEvidence, tracker)))

        // the actors who did not present evidence cannot own any of the subjects that were part of the suspicion
        action.suspicion
            .filter(s => !tracker.actorsSubjects.includes(s))
            .forEach(s => actorsWithoutEvidence.forEach(a => formulas.push(`!${tracker.keyForSubject(s, a)}`)))
    }

    // CASE 3
    // only of use for three players and if it's someone else's turn
    if (tracker.actors.length === 3 && action.actor !== tracker.actor) {
        [0, 1, 2].forEach(assumeShown => {
            const actor = actorsWithEvidence[0]
            const suspicion = [...action.suspicion]
            suspicion.splice(assumeShown, 1)
            const beforeImplication = suspicion.map(s => `!${tracker.keyForSubject(s, actor)}`).join('&')
            const afterImplication = tracker.keyForSubject(action.suspicion[assumeShown], actor)
            // console.log('CASE 3', `${beforeImplication} => ${afterImplication}`)
            formulas.push(`${beforeImplication} => ${afterImplication}`)
        })
    }

    Object.keys(action.evidence).forEach(actor => {
        if (actor === tracker.actor) return

        const ev = action.evidence[actor]

        if (ev === null) return
        if (ev === '?') return // todo formulas.push(` => !${tracker.keyForSubject(ev)}`)
        else {
            tracker.actors.forEach(a => {
                if (a === actor) formulas.push(`${tracker.keyForSubject(ev, a)}`)
                else formulas.push(`!${tracker.keyForSubject(ev, a)}`)
            })
        }
    })

    console.log('The following formulas have been generated:', formulas)
    return formulas
}

// returns the formula for the case
// "if one of {actors} doesnt have it, then its the solution"
function formula_notActorsMeansSolution(evidence, actors, tracker) {
    const notActors = actors.map(a => `!${tracker.keyForSubject(evidence, a)}`).join('&')
    return `${notActors} => ${tracker.keyForSubject(evidence)}`
}

module.exports = {
    ActionTracker,
}
