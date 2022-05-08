
class Netring
{
    params = {
        ringsCount: 3,
        dotsCount: 40,
        scale: 0.8,
        width: 800,
        height: 600,
        fullscreen: true,
        color: '#ade1e0',
        speeds: [
            [0, 3.5, 0],
            [0, -2.5, 0],
            [0, 4.0, 0],
        ],
        angles: [
            [0, 0, 0.1],
            [0.3, 0, -0.3],
            [0.8, 0, 1],
        ]
    }

    constructor(select, params)
    {
        this.canvas = document.querySelector(select)
        if (!this.canvas)
            return

        this.params = { ...this.params, ...params }

        this.init()
    }

    init()
    {
        this.context = this.canvas.getContext('2d')
        this.startTime = (new Date()).getTime()

        this.matrix = []
        this.rings = []

        for (let j = 0; j < this.params.ringsCount; j++) {
            this.rings[j] = []
            for (let i = 0; i < this.params.dotsCount; i++) {
                this.rings[j][i] = [Math.sin(Math.PI / this.params.dotsCount * 2 * i), Math.cos(Math.PI / this.params.dotsCount * 2 * i), 0.0]
            }
        }

        this.rings_t = []
        for (let j = 0; j < this.params.ringsCount; j++) {
            this.rings_t[j] = []
            for (let i = 0; i < this.params.dotsCount; i++) {
                this.rings_t[j][i] = [0.0, 0.0, 0.0]
            }
        }

        this.refresh()
        this.events();
    }

    events()
    {
        window.addEventListener('resize', e => {
            this.refresh()
        })
    }

    refresh()
    {
        if (this.params.fullscreen === true)
        {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
        } else {
            this.canvas.width = this.params.width
            this.canvas.height = this.params.height
        }

        this.centerX = this.canvas.width / 2
        this.centerY = this.canvas.height / 2
        this.scale = Math.min(this.canvas.width, this.canvas.height) / 2 * 0.8
    }

    rotateX(angle, points, points_t)
    {
        this.matrix = [
            [1.0, 0.0, 0.0],
            [0.0, Math.cos(angle), -Math.sin(angle)],
            [0.0, Math.sin(angle),  Math.cos(angle)]
        ]

        this.transform(points, points_t)
    }

    rotateY(angle, points, points_t)
    {
        this.matrix = [
            [Math.cos(angle),   0, Math.sin(angle)],
            [0,                 1, 0],
            [-Math.sin(angle),  0, Math.cos(angle)]
        ]

        this.transform(points, points_t)
    }

    rotateZ(angle, points, points_t)
    {
        this.matrix = [
            [Math.cos(angle), -Math.sin(angle), 0.0],
            [Math.sin(angle),  Math.cos(angle), 0.0],
            [0.0, 0.0, 1.0]
        ]

        this.transform(points, points_t)
    };

    transform(points, points_t)
    {
        for (let i = 0; i < points.length; i++)
        {
            let x = points[i][0]
            let y = points[i][1]
            let z = points[i][2]

            points_t[i][0] = x * this.matrix[0][0] + y * this.matrix[1][0] + z * this.matrix[2][0]
            points_t[i][1] = x * this.matrix[0][1] + y * this.matrix[1][1] + z * this.matrix[2][1]
            points_t[i][2] = x * this.matrix[0][2] + y * this.matrix[1][2] + z * this.matrix[2][2]
        }
    }

    preparePoints(points)
    {
        for (let j = 0; j < points.length; j++)
        {
            for (let i = 0; i < points[j].length; i++)
            {
                let distance = (0.9 + points[j][i][2] / 10)
                let size = (3 + points[j][i][2]) / 2
                points[j][i] = [points[j][i][0] * this.scale * distance + this.centerX, -points[j][i][1] * this.scale * distance + this.centerY, size, points[j][i][0], points[j][i][1], points[j][i][2]]
            }
        }
    }

    showPoints(points)
    {
        for (let j = 0; j < points.length; j++)
        {
            for (let i = 0; i < points[j].length; i++)
            {
                this.context.beginPath()
                this.context.arc(points[j][i][0], points[j][i][1], points[j][i][2], Math.PI, -Math.PI, false)
                this.context.fill()
            }
        }
    }

    distance(point1, point2)
    {
        return Math.sqrt(Math.pow(point1[3] - point2[3], 2) + Math.pow(point1[4] - point2[4], 2) + Math.pow(point1[5] - point2[5], 2))
    }

    showLines(points)
    {
        for (let j = 0; j < points.length - 1; j++)
        {
            for (let i = 0; i < points[j].length; i++)
            {
                for (let l = j + 1; l < points.length; l++)
                {
                    for (let z = 0; z < points[l].length; z++)
                    {
                        let distance = (-this.distance(points[j][i], points[l][z]) + 0.8)
                        if (distance < 0)
                            continue

                        this.context.beginPath()
                        this.context.moveTo(points[j][i][0], points[j][i][1])
                        this.context.lineTo(points[l][z][0], points[l][z][1])
                        this.context.lineWidth = distance
                        this.context.stroke()
                    }
                }
            }
        }
    }

    update()
    {
        let time = ((new Date()).getTime() - this.startTime) * 0.0001

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.context.fillStyle = this.params.color
        this.context.strokeStyle = this.params.color

        for (let i = 0; i < this.params.ringsCount; i++)
        {
            // Animation
            if (this.params.speeds[i][0])
                this.rotateX(time * this.params.speeds[i][0], this.rings[i], this.rings_t[i])
            if (this.params.speeds[i][1])
                this.rotateY(time * this.params.speeds[i][1], this.rings[i], this.rings_t[i])
            if (this.params.speeds[i][2])
                this.rotateZ(time * this.params.speeds[i][2], this.rings[i], this.rings_t[i])

            // Static
            if (this.params.angles[i][0])
                this.rotateX(Math.PI * this.params.angles[i][0], this.rings_t[i], this.rings_t[i])
            if (this.params.angles[i][1])
                this.rotateY(Math.PI * this.params.angles[i][1], this.rings_t[i], this.rings_t[i])
            if (this.params.angles[i][2])
                this.rotateZ(Math.PI * this.params.angles[i][2], this.rings_t[i], this.rings_t[i])
        }

        this.preparePoints(this.rings_t)
        this.showPoints(this.rings_t)
        this.showLines(this.rings_t)
    }

    start()
    {
        this.animate();
    }

    animate()
    {
        if (!this.canvas)
            return

        requestAnimationFrame(() => {
            this.animate()
        })

        this.update()
    }
}

export default Netring
