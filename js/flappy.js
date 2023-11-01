function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

// const b = new Barrier(true)
// b.setHeight(200)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function pairOfBarriers(height, operture, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.higher = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.bottom.element)

    this.drawOpening = () => {
        const heightOperture = Math.random() * (height - operture)
        const heightBottom = height - operture - heightOperture
        this.higher.setHeight(heightOperture)
        this.bottom.setHeight(heightBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
}

// const b = new pairOfBarriers(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(height, width, operture, space, notifyPoint) {
    this.pairs = [
        new pairOfBarriers(height, operture, width),
        new pairOfBarriers(height, operture, width + space),
        new pairOfBarriers(height, operture, width + space * 2),
        new pairOfBarriers(height, operture, width + space * 3),
    ]

    // constante de deslocamento
    const displacement = 3
    // construindo a animação do cenário
    this.cheer = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            // calculando quando o elemento sai da tela
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.drawOpening()
            }

            const middle = width / 2
            // calculo se cruzou o meio da tela
            const passedTheMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (passedTheMiddle) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let fly = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    // quando o usuário preciona qualquer tecla o passaro voa
    window.onkeydown = e => fly = true
    // quando o usuário solta a tecla o passaro cai
    window.onkeyup = e => fly = false

    // fazendo a animação de voo do passaro
    this.cheer = () => {
        const newY = this.getY() + (fly ? 8 : -5)
        // definindo a altura máxima que o passaro pode voar
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    // colocando o passaro no meio da tela
    this.setY(gameHeight / 2)
}

// função para calcular a pontuação do usuário
function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

// // montando o loop de tela com a animação das barreiras, passaro e pontuação
// const barriers = new Barriers(700, 1200, 200, 400)
// const bird = new Bird(700)
// const gameArea = document.querySelector('[wm-flappy')
// gameArea.appendChild(bird.element)
// gameArea.appendChild(new Progress().element)
// barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
// setInterval(() => {
//     barriers.cheer()
//     bird.cheer()
// }, 20)

// teste de sobreposição (verificando colisão)
function testOverlap(elementA, elementB) {
    // pegando os retângulos associados aos elentos
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

// função que verifica se houve a colisão
function Collided(bird, barriers) {
    // marco a colisão como false para iniciar
    let collided = false
    barriers.pairs.forEach(pairOfBarriers => {
        if (!collided) {
            const higher = pairOfBarriers.higher.element
            const bottom = pairOfBarriers.bottom.element
            collided = testOverlap(bird.element, higher)
                || testOverlap(bird.element, bottom)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0
    const gameArea = document.querySelector('[wm-flappy')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    // loop do jogo
    this.start = () => {
        // criando o temporizador
        const timer = setInterval(() => {
            barriers.cheer()
            bird.cheer()

            if (Collided(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()