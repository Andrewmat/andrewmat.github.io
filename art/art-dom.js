export default function artAsDOM(tree) {
  return block(tree, createScope({ defs: new Map() }))
}

function block(commands, scope) {
  const defs = new Map()
  commands
    .filter(c => c.value === 'def')
    .forEach(c => {
      def(c.args, defs)
    })

  const drawedObjs = commands
    .filter(c => c.value === 'draw')
    .map(c => draw(c.args.value, defs, scope))

  return drawedObjs
}

function def({ name, value }, defs) {
  if (defs.has(name.value)) {
    throw new Error(`Cannot define '${args.name.value}'. It is already defined`)
  }
  defs.set(name.value, value)
}

function draw(object, defs, scope) {
  let children = []
  if (object.children.length > 0) {
    children = block(object.children, createScope(scope, defs))
  }
  if (!object.name.native) {
    return drawCustom(object, children, defs, scope)
  } else {
    return drawNative({
      name: object.name.value,
      attributes: object.attributes,
      children: children,
    })
  }
}

function drawCustom(object, children, defs, scope) {
  const definedObject = findObjectDefinition(object, defs, scope)
  const mergedObject = {
    name: definedObject.name,
    attributes: {
      ...definedObject.attributes,
      ...object.attributes,
    },
    children: {
      ...definedObject.children,
      ...children,
    },
  }
  return draw(mergedObject, defs, scope)
}

function drawNative({ name, attributes, children }) {
  const domElem = document.createElementNS('http://www.w3.org/2000/svg', name)
  Object.entries(attributes).forEach(([attrName, attrValue]) => {
    const finalName = attrNameToSvg(attrName, name)
    const finalValue =
      attrValue.type === 'number' ? `${attrValue.value}` : attrValue.value
    domElem.setAttribute(finalName, finalValue)
  })
  children.forEach(c => {
    domElem.appendChild(c)
  })

  return domElem
}

function findObjectDefinition(object, defs, scope) {
  let foundObject
  if (defs.has(object.name.value)) {
    foundObject = defs.get(object.name.value)
  } else if (scope.defs.has(object.name.value)) {
    foundObject = scope.defs.get(object.name.value)
  } else {
    throw new Error(`Cannot find object '${object.name.value}'`)
  }
  if (
    !foundObject ||
    !foundObject.name ||
    !foundObject.attributes ||
    !foundObject.children
  ) {
    throw new Error(`Object ${object.name} is not valid`)
  }
  return foundObject
}

function createScope(scope = {}, defs = new Map()) {
  const newScope = {
    defs: new Map([...scope.defs, ...defs]),
  }
  return newScope
}

function attrNameToSvg(name, type) {
  switch (name) {
    case 'x':
      return 'cx'
    case 'y':
      return 'cy'
    case 'radius': {
      if (type === 'circle') {
        return 'r'
      }
      return name
    }
    case 'color':
      return 'fill'
    default:
      return name
  }
}
