const game = require('./game')

async function run(actionTracker, exprFormulas, variables) {
    console.log('Clue solver V1 - Welcome.')
    console.log('Type')
    console.log('\t- n to start a new game')
    console.log('\t- q to quit')
    console.log()

    const line = await readLine()
    if (line === 'q') {
        console.log('Bye.')
        return
    }
    if (line === 'n') {
        while (true) {
            const action = await readAction(actionTracker)
            actionTracker.addAction(action)

            const formulas = actionTracker.getFormulas(action)
            console.log(formulas)
            exprFormulas.push(...formulas)
            console.log(exprFormulas)

            game.trySolve(exprFormulas, variables, actionTracker)
        }
    }
}

async function readAction(actionTracker) {
    while (true) {
        const actors = actionTracker.actors
        const weapons = actionTracker.subjects[0]
        const subjects = actionTracker.subjects[1]
        const rooms = actionTracker.subjects[2]

        process.stdout.write('\nNew Action:\n')
        process.stdout.write('Actor: ')
        const actor = await readFromList(actors)

        process.stdout.write('Suspicion\n\tWeapon: ')
        const weapon = await readFromList(weapons)

        process.stdout.write('\tMurderer: ')
        const subject = await readFromList(subjects)

        process.stdout.write('\tRoom: ')
        const room = await readFromList(rooms)

        const suspicion = [weapon, subject, room]
        const evidence = {}

        while (true) {
            if (Object.keys(evidence).length > 0) {
                process.stdout.write(`Evidence presented so far: ${Object.keys(evidence).map(a => `${evidence[a]} by ${a}`).join(', ')}.\n\n`)
            }

            process.stdout.write('Type a name to add evidence or press enter to finish\n')
            const name = await readFromList([...actors, ''])

            if (name === '') break
            else {
                process.stdout.write(`Evidence presented by ${name}: `)
                presented = await readFromList([...actionTracker.subjects.flat(), '?'])
                evidence[name] = presented
            }
        }

        actors.filter(a => a !== actionTracker.actor).forEach(a => {
            if (evidence[a] === undefined) evidence[a] = null
        })

        console.log(`Actor: ${actor}`)
        console.log(`Weapon: ${weapon}`)
        console.log(`Murderer: ${subject}`)
        console.log(`Room: ${room}`)
        console.log(`Evidence: ${Object.keys(evidence).map(a => `${evidence[a]} by ${a}`).join(', ')}`)
        process.stdout.write('\nIs this correct? [Y/n] ')

        const yesNo = (await readFromList(['y', 'Y', 'n', 'N', ''])).toLowerCase()
        switch (yesNo) {
            case 'y':
            case '':
                process.stdout.write('\n\n')
                return { actor, suspicion, evidence }

            case 'n':
                continue
        }
    }
}

async function readFromList(list) {
    while (true) {
        const l = (await readLine()).trim()
        const options = list.filter(o => o.startsWith(l))
        const exact = list.filter(o => o === l)

        if (options.length === 1) {
            return options[0]
        } else if (exact.length === 1) {
            return exact[0]
        } else if (options.length < 1) {
            process.stdout.write(`Invalid value "${l}". Try again: `)
            continue
        } else if (options.length > 1) {
            process.stdout.write(`Input ambiguous: ${options.join(', ')}. Try again: `)
            continue
        }
    }
}

async function readLine() {
    return new Promise((resolve, reject) => {
        process.stdin.once('data', function (_line) {
            const line = _line.toString()
            resolve(line.substr(0, line.length - 2))
        })
    })
}

module.exports = {
    run
}