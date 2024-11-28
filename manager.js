// takes array of objects and displays dashboard

let ta = document.querySelector('textarea')

let canvParent = document.getElementById("canv")
gc.initCanvas(canvParent)

let projDiv = document.querySelector('#projectsContainer')
console.warn(projects )

function addProject(key) {
  let proj = projects[key]
  let p = document.createElement('div')
  p.innerHTML = proj.name ?? key
  // console.log('addProj ', proj)
  p.addEventListener('click', () => {
    let p2 = document.querySelector('#program')
    // console.log(proj)
    gc.clear()
    ta.value = proj.prog
    eval(proj.prog)
  })
  projDiv.appendChild(p)
}

for (let key in projects) {
  // addProject(projects[key])
  addProject(key)
}