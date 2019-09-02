import { artParser, artInterpreter, artSvgRenderer } from './dist/art-parser.js'

const $ = document.querySelector.bind(document)

const example = `
def normalCircle circle(r: 20, cx: 30, cy: 30)

svg(width: 200, height: 200) {
  def <bigger circle> normalCircle(r: radius => radius * 1.7)

  rect(
    fill: '#ccc',
    stroke: 'black',
    x: 0,
    y: 0,
    width: '100%',
    height: '100%'
  )

  def target g() {
    <bigger circle>(fill: 'red')
    normalCircle(fill: 'blue')
  }

  normalCircle(
    fill: 'green',
    cx: parentX => parentX * 3,
    cy: parentY => parentY * 3
  )

  target()
}
`.trim()

$('#input').value = example

$('#submit').addEventListener('click', () => {
  $('#output').innerHTML = ''
  const targetString = $('#input')
    .value.split('\n')
    .map(line => line.trim())
    .join('')

  const parseResponse = artParser.run(targetString)

  if (parseResponse.isError) {
    console.error(parseResponse.error)
    return
  }

  const treeDom = artInterpreter(parseResponse.result, artSvgRenderer)
  treeDom.forEach(dom => {
    $('#output').appendChild(dom)
  })
})
