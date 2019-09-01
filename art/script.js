import { artParser, artInterpreter, artSvgRenderer } from './dist/art-parser.js'
// import artAsDOM from './art-dom.js'

const $ = document.querySelector.bind(document)

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

  // if (tree.isError) {
  //   $('#output').value = tree.error
  // } else {
  //   $('#output').value = JSON.stringify(tree.result, 0, 2)
  // }
})
