import { max, mean, min } from "lodash-es"
import pathAst from "path-ast"

const { floor, random } = Math
const randInt = (min, max) => floor(random() * (max - min + 1)) + min
const sample = arr => arr[randInt(0, arr.length - 1)]

export const FACE_CATEGORIES = [
  "circle",
  "eye",
  "nose",
  "mouth",
  "bowtie",
  "hat"
]

export const getBoundingRect = astOfPath => {
  const [xValues, yValues] = [[], []]

  astOfPath.commands.forEach(command => {
    if (typeof command.params.x !== "undefined") {
      xValues.push(command.params.x)
    }
    if (typeof command.params.y !== "undefined") {
      yValues.push(command.params.y)
    }
  })

  const [minX, maxX] = [min(xValues), max(xValues)]
  const [minY, maxY] = [min(yValues), max(yValues)]
  const [width, height] = [maxX - minX, maxY - minY]
  const [cx, cy] = [width / 2 + minX, height / 2 + minY]

  return { minX, minY, maxX, maxY, cx, cy, width, height }
}

export const parsePath = path => {
  const ast = pathAst.parse(path)
  const rect = getBoundingRect(ast)
  return { path, ast, rect }
}

export const pointsToPath = pts => {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join("")
}

export const parseDrawing = drawing => {
  const strokes = drawing.map(([xs, ys]) => xs.map((x, i) => [x, ys[i]]))
  const path = strokes.map(pointsToPath).join(" ")
  const ast = pathAst.parse(path)
  const rect = getBoundingRect(ast)
  return { strokes, path, ast, rect }
}

export const getRandomDrawings = (data, categories = FACE_CATEGORIES) => {
  return categories.reduce((face, key) => {
    const { word, countrycode, timestamp, drawing } = sample(data[key])
    const parsed = parseDrawing(drawing)
    face[key] = { key, word, countrycode, timestamp, ...parsed }
    return face
  }, {})
}

export const makeFace = data => {
  const drawings = getRandomDrawings(data)

  // circle
  const { ast: circle, rect: circleRect } = drawings.circle

  // nose
  const { nose: noseOrig } = drawings

  const nose = pathAst
    .parse(noseOrig.path)
    .scale(0.1)
    .translate(
      circleRect.cx - noseOrig.rect.cx,
      circleRect.cy - noseOrig.rect.cy
    )

  // mouth
  const { mouth: mouthOrig } = drawings
  const noseRect = getBoundingRect(nose)

  const mouth = pathAst
    .parse(mouthOrig.path)
    .scale(0.15)
    .translate(
      circleRect.cx - mouthOrig.rect.cx,
      mean([noseRect.maxY, circleRect.maxY]) - mouthOrig.rect.cy
    )

  // eyes
  const { eye: eyeOrig } = drawings
  const eyeXBase = circleRect.cx - eyeOrig.rect.cx
  const eyeY = mean([noseRect.minY, circleRect.minY]) - eyeOrig.rect.cy

  const eyeLeft = pathAst
    .parse(eyeOrig.path)
    .scale(0.1)
    .translate(eyeXBase - 50, eyeY)

  const eyeRight = pathAst
    .parse(eyeOrig.path)
    .scale(0.1)
    .translate(eyeXBase + 50, eyeY)

  return {
    circle: pathAst.stringify(circle),
    nose: pathAst.stringify(nose),
    mouth: pathAst.stringify(mouth),
    eyeLeft: pathAst.stringify(eyeLeft),
    eyeRight: pathAst.stringify(eyeRight)
  }
}
