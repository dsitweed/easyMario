
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

const MOVE_SPEED = 100
const JUMP_FORCE = 350
const FALL = 400
let isJumping = true

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('wall', '3e5YRQd.png')
loadSprite('iceevil-shroom', 'SvV4ueD.png')
loadSprite('iceblock','gqVoI2b.png')
loadSprite('icebrick','fVscIbn.png')


scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '             c                        ',
            '                                      ',
            '              a  =%a==#     $         ',
            '                            ()        ',
            '               c            {}        ',
            '===  ========================   ======',
        ],
        [
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                                            ',
            'w                        x                   ',
            'w                        x                   ',
            'w                    x   x   z    z          ',
            'w                x   x   x                () ',
            'w         z   x  x   x   x           z    {} ',
            'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',   
        ],
        [   '                                              ',
            '                                              ',
            '                                              ',
            '                                              ',
            '      x      x       xx        x              ',
            '      xx     x     x    x      x              ',
            '      x x    x    x      x     x              ',
            '      x  x   x    x       x    x              ',
            '      x   x  x    x      x                    ',
            '      x    x x      x   x                     ',
            '      x      x        x        x              ',
            '                                              ',
            '                                              ',
            'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',   
        ]
    ]

    const levelCfg =
    {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '#': [sprite('surprise'), solid(), 'mushroom-surprise'],
        'a': [sprite('surprise'), solid(), 'evil-shroom-surprise'],
        'b': [sprite('mushroom'), solid(), 'mushroom', body()],
        'c': [sprite('evil-shroom'), solid(), 'dangerous', body()],
        'd': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-top-left'), solid(), scale(0.5),'pipe'],
        ')': [sprite('pipe-top-right'), solid(), scale(0.5),'pipe'],
        '{': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        '}': [sprite('pipe-bottom-right'), solid(), scale(0.5)],

        'z': [sprite('iceevil-shroom'), solid(), 'dangerous', body(),scale(0.5)],
        'x': [sprite('iceblock'), solid(),scale(0.5)],
        'w': [sprite('wall'), solid(),scale(0.5)],
        'v': [sprite('icebrick'), solid(),scale(0.5)],

        


    }//Map level detail

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLable = add([
        text(score),
        pos(30, 50),
        layer('ui'),
        {
            value: score,
        }
    ])

    add([text('level ' + parseInt(level+1)), pos(4,6)])

    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    timer = timer - dt()
                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },    //update
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1, 1)
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(1)
                timer = time
                isBig = true

            }
        }//return
    }//big function

    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot'),

    ])

    action('mushroom', (m) => {
        m.move(10, 0)
    })//mushroom move

    const ENEMY_SPEED = 20

    action('dangerous', (ec) => {
        ec.move(-ENEMY_SPEED, 0)
    })//evil-shroom move

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL) {
            go('lose', { score: scoreLable.value })
        }
    })

    /* player.action(() => {
        if( !player.grounded())
        {
            isJumping = true
        }
    })//in ground -> isjumping false */

    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    })//in ground -> isjumping false

    keyPress('space', () => {
        if (player.grounded()) {
            isJumping = true;
            player.jump(JUMP_FORCE);
        }
    })//true


    player.on('headbump', (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('d', obj.gridPos.sub(0, 0))
        }
        if (obj.is('evil-shroom-surprise')) {
            gameLevel.spawn('c', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('d', obj.gridPos.sub(0, 0))
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('b', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('d', obj.gridPos.sub(0, 0))
        }
    })//xuat hien cac vat trong hop

    player.collides('pipe', () => {
        keyPress("down",() => {
            go('game', {
                level: level + 1,
                score: scoreLable.value

            })
        })
    })

    player.collides('mushroom', (m) => {
        destroy(m)
        scoreLable.value++
        scoreLable.text = scoreLable.value
        player.biggify(6)
    })//eat mushroom and grow

    player.collides('coin', (c) => {
        destroy(c)
        scoreLable.value++
        scoreLable.text = scoreLable.value
    })//eat coin

    player.collides('dangerous', (t) => {
        if (isJumping) {
            destroy(t)
            scoreLable.value++
            scoreLable.text = scoreLable.value
        }

        /* if (!isJumping) {
            go('lose', { score: scoreLable.value })
        } */

    })//touch evil

}) //scene game

scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})//scene lose



start("game", ({ level: 0, score: 0 }))
