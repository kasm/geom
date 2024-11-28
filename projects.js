

p12 = `
gc.clear()
let p0 = gc.point(-150, 200, 'green')
let p1 = gc.point(-110, 120, 'green')
let p2 = gc.point(55, 10)
let p3 = gc.point(100, 110)
let lii = gc.line(p0, p1)
let li2 = gc.line(p1,p2)
let li3 = gc.line(p2,p3)
let p00 = gc.point(0, 0)
let pp = gc.perPoint(lii, p00)
let ppar = gc.parPoint(lii, -55)
console.log(lii)
let p4 = gc.point(50, 50)
let li4 = gc.perLine(lii, p4)
let lir = gc.line(p2, p3)
let lia = gc.absLine(lii, lir)
let lir2 = gc.relLine(lii, lia)
let p5 = gc.lineGetRel(lii, {x: 5, y:0})
lir2.c +=3
console.log(lir, lia)

//d([p0, p1, lii, pp, ppar, p4, li4, p2, p3, li2, li3])
d([p0, p1, lii, pp, ppar, p2, p3, lir, p5, lia, lir2])
`

tapeTriangle = `
gc.drawAxis()
let p0 = gc.point(-150, 280, 'green')
let p1 = gc.point(-110, 120, 'green')
let p2 = gc.point(55, 150)
let p3 = gc.point(85, 110)
let p4 = gc.point(120, 125)
let p5 = gc.point(150, 115)
let p6 = gc.point(170, 145)
let p7 = gc.point(175, 255)

let s1 = gc.seg([p0, p1, p2, p3,p4,p5, p6, p7, gc.clone(p0)])
gc.move(s1, gc.point(-1, -110))
s1.color = 'red'
// let s1r = gc.rotate(s1, .5, p0);s1 = s1r

d([s1])

d([s1])
let s2 = gc.shiftPline(s1, 0)
let s3 = gc.shiftPline(s1, 100)
d(s3,'red')
s2 =gc.filletPoly(s2, 132)
let trs2 = gc.triangles1(s2, gc.point(110, 111))
console.log('trs2 ', trs2)
s3 =gc.filletPoly(s3, 142)

console.log('s2 ', s2)
d([s2, s3], null, 1)
let trs = gc.triangles(s2, s3)
console.log("trssss ", trs)
trs.forEach(t => gc.dtr(t))
trs2.forEach(t => gc.dtr(t, 'green'))
console.log("trs2 ")
let li1 = gc.line(p1, p2)
let li2 = gc.line(p2, p3)
let pnts = gc.filletLines(li1, li2, 33, 33)
let pnts2 = gc.filletSeg(p1, p2, p2, p3, 23)
let sf = gc.seg(pnts2)
d([sf])

let sfn = gc.filletPoly(s1, 22)
d(sfn)

`

function generateArrowPoly() {
  console.warn('gen arrow poly')
  let tipLen = 150
  let tipWidth = 130
  let width = 60
  
  // let tip = this.positionTip
  // let tail = this.positionTail
  // let dx = tip.x - tail.x
  // let dy = tip.y - tail.y
  let len = 355 // Math.sqrt(dx * dx + dy * dy)
  let gc = new GeomCore()

  let poly = [
    0,-20,
    //  130, 50,
      tipWidth, tipLen+13,
      width, tipLen,
      width, len,
      //,
      //0, len,
  ]
  let pts = []
  for (let i=0; i<poly.length; i+=2) {
      pts.push(gc.point(poly[i], poly[i+1]))
  }
  // poly.forEach(p => pts.push(gc.point(p[0], p[1])))
  let gPoly = gc.seg(pts)
  gPoly = gc.mirrow(gPoly)

  return gPoly
  
 }

triangulation = `
gc.clear()

let pl = generateArrowPoly()
pl.isClosed = true
gc.move(pl, {x: 0, y:-151})
d([pl])

let pl3 = gc.shiftPline(pl, 31)
d(pl3, 'red')


let pl2f = gc.filletPoly(pl, 13)
let pl3f = gc.filletPoly(pl3, 33)
d([pl2f, pl3f], 'green')

let trs = gc.triangles(pl2f, pl3f)
d(trs)

`

trimPoly =`
gc.clear()
gc.drawAxis()
let p1 = gc.point(100, 10)
let p2 = gc.point(-100, 100)
let p3 = gc.point(-90, 0)
let p4 = gc.point(-90, 50)
let p5 = gc.point(100, 280)
let p6 = gc.point(-100, 280)
let p7 = gc.point(100, 80)
let p8 = gc.point(110, -89)
let p9 = gc.point(10, -99)

// d(p3)
let pl = gc.seg([p1, p2, p3, p4, p5, p6, p7, p8, p9])
gc.move(pl, {x:-110, y:0})
let plt = gc.clone(pl)
console.log('plt ', JSON.stringify(plt))
gc.trimPoly(plt)
gc.move(plt, {x: 211, y:0})
 d([pl])
 d(plt)
`

let intersection = `
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



// p=`
// let p1 =gc.point(111,111)
// d(p1)
// `


points = `
gc.clear()
gc.drawAxis()
let p0 = gc.point(100, 10)
let p1 = gc.point(-100, 100)
let p2 = gc.point(-90, 0)
let p3 = gc.point(-70, 30)
d([p0, p1, p2, p3])
`







let projects = {
    points: {
        //   name: 'g2',
        prog: points
    },



    intersection: {
        prog: intersection
    },
    triangulation: {
        prog: triangulation
    },
    trimPoly: {
        prog: trimPoly
    },

    p12: {
        prog: p12
    },
    tapeTriangle: {
        prog: tapeTriangle
    }
}
