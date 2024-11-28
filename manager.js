// takes array of objects and displays dashboard

let projects = {
  'g1': {
    name: 'g1',
    prog: `
    
gc.clear()
gc.drawAxis()
let p0 = gc.point(100, 10)
let p1 = gc.point(-100, 100)
let p2 = gc.point(-90, 0)
let p3 = gc.point(-70, 30)

let pl = gc.seg([p0, p1, p2, p3])

let seg1 = gc.seg([p0, p1])
let seg2 = gc.seg([p2, p3])
let p4 = gc.int(seg1, seg2, {asLines: true})
let p5 = gc.mid(p0, p3)
let p6 = gc.int(seg1, p5, {asLines: true})

console.log('p5 ', p5, seg1, seg2)

// d([p0, p1, p2, p3, p4])
d([p0, p1, p2, p3, p4, p5, p6])
d(pl)


    `
  },
  g2: {
    name: 'g2',
    prog: `
      gc.clear()
      gc.drawAxis()
      let p0 = gc.point(100, 10)
      let p1 = gc.point(-100, 100)
      let p2 = gc.point(-90, 0)
      let p3 = gc.point(-70, 30)
      d([p0, p1, p2, p3])
    `}
  }

  let ta = document.querySelector('textarea')

let projDiv = document.querySelector('#projectsContainer')
console.warn(projects )
function addProject(proj) {
  let p = document.createElement('div')
  p.innerHTML = proj.name
  console.log('addProj ', proj)
  p.addEventListener('click', () => {
    let p2 = document.querySelector('#program')
    console.log(proj)
    ta.value = proj.prog
    eval(proj.prog)
  })
  projDiv.appendChild(p)
}

for (let key in projects) {
  addProject(projects[key])
}