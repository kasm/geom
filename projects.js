

lines = `
gc.clear()
gc.drawAxis()
let p0 = gc.point(-150, 200, 'green')
let p1 = gc.point(-110, 120, 'green')
let p2 = gc.point(55, 10)
let p3 = gc.point(100, 110)
let lii = gc.line(p0, p1)
let li2 = gc.line(p1,p2)
let li3 = gc.line(p2,p3)
let p00 = gc.point(20, 100)
let pp = gc.perPoint(lii, p00)
pp.name = "per1"
let ppar = gc.pointPar(lii, -55)
ppar.name = "par1"
let p4 = gc.point(250, -50)
let li4 = gc.perLine(lii, p4)
let lir = gc.line(p2, p3)
let lia = gc.absLine(lii, lir)
let lir2 = gc.relLine(lii, lia)
let p5 = gc.lineGetRel(lii, {x: 5, y:0})
p5.name = 'rel01'
lir2.c +=30
console.log(lir, lia)

//d([p0, p1, lii, pp, ppar, p4, li4, p2, p3, li2, li3])
d([p0, p1, p00, lii, pp, ppar, p2, p3, lir, p5, lia, lir2, li4, p4])
`


intersectionSteps = `
gc.clear()
gc.drawAxis()
let p0 = gc.point(-150, 200, 'green')
let p1 = gc.point(-110, 120, 'green')
let p2 = gc.point(55, 10)
let p3 = gc.point(100, 110)
let li1 = gc.line(p0, p1)
let li2 = gc.line(p2, p3)

let p2rel = gc.lineGetRel(li1, p2)
let p3rel = gc.lineGetRel(li1, p3)
p2rel.name = 'p2rel'
p3rel.name = 'p3rel'

let p1rel = gc.lineGetRel(li2, p1)
let p0rel = gc.lineGetRel(li2, p0)
p1rel.name = 'p1rel'
p0rel.name = 'p0rel'

if (p0rel.y * p1rel.y < 0 && p2rel.y * p3rel.y < 0) {
    let intPoint = gc.int(li1, li2)
    d(intPoint, 'red', 22)
}

d([p0, p1, p2, p3, li1, li2, p2rel, p3rel, p1rel, p0rel])

`

tapeTriangle = `
gc.clear()
gc.drawAxis()
let p0 = gc.point(-150, 280, 'green')
let p1 = gc.point(-110, 120, 'green')
let p2 = gc.point(55, 150)
let p3 = gc.point(85, 110)
let p4 = gc.point(120, 125)
let p5 = gc.point(150, 115)
let p6 = gc.point(170, 145)
let p7 = gc.point(175, 225)


let s1 = gc.seg([p0, p1, p2, p3,p4,p5, p6, p7, gc.clone(p0)])
// let s1 = gc.seg([p0, p1, p2, p3,p4,p5, p6, p7])
s1.isClosed = true
// d(s1, 'blue')
// d(s1.pts)

gc.move(s1, gc.point(-1, -110))
s1.color = 'red'
// d(s1)

let s2 = gc.shiftPline(s1, 10)
// d(s2, 'green')
let s3 = gc.shiftPline(s1, 100)
// d(s3,'red')
s2 =gc.filletPoly(s2, 32)
// s2 = gc.trimPoly(s2)
let trs2 = gc.triangles1(s2, gc.point(110, 111))
console.log('trs2 ', trs2)
s3 =gc.filletPoly(s3, 142)
// s3 = gc.trimPoly(s3)
// sfs.gs
console.log('s2 ', s2)
// d([s2, s3], null, 1)
// sfs.gs

let trs = gc.triangles(s2, s3)
console.log("body triangles ", trs)

trs.forEach(t => gc.dtr(t))
trs2.forEach(t => gc.dtr(t, 'green'))

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

console.log('p5 ', p5, seg1, seg2)

// d([p0, p1, p2, p3, p4])
d([p0, p1, p2, p3, p4, p5])
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

    trimPoly: {
        prog: trimPoly
    },

    lines: {
        prog: lines
    },
    tapeTriangle: {
        prog: tapeTriangle
    },
    intersectionSteps: {
        prog: intersectionSteps
    }
}
