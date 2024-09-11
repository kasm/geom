/**
 * Created by Dima on 04.01.2018.
 */

let d = null

class GeomCore {
    eps = .000001
    pointCount = 0
    isDebug = false
    isCanvas = true
    ctx = null
    constructor(width, height) {
        this.width = width ?? 600
        this.height = height ?? 600
        if (this.isCanvas) this.initCanvas()
    }
    conv(p) {
        if (p?.type === 'point') {
            return {
                type: 'point',
                x: p.x + this.width / 2,
                y: this.height / 2 - p.y
            }
        }
    }
    
    initCanvas() {
        let canv = document.createElement('canvas')
        this.ctx = canv.getContext('2d')
        canv.width = this.width
        canv.height = this.height
        canv.style = 'position: fixed; z-index: 99999; width: 600px; height: 600px; left: 0px; top:0px;';
        canv.id = 'geomCanv'
        document.querySelector('body').appendChild(canv)  
        d = this.d.bind(this)  
    }

    drawAxis() {
        d({type: 'line', a: 1, b: 0, c:0})
        d({type: 'line', a: 0, b: 1, c:0})
    }

    dp(p, color) {
        let r = 4
        let ctx = this.ctx

        ctx.moveTo(0, 0)
        ctx.lineTo(111,111)
        ctx.stroke()
        let col = (color ?? p.color) ?? 'black'
        //c = c ?? 'black'
        if (p?.type === 'point') {
              ctx.beginPath()
              ctx.fillStyle = col
              ctx.strokeStyle = col
              let c = this.conv(p)
              console.log('draw point  type ', c)

            //   ctx.arc(c[0], c[1], r, 0, Math.PI*2)
              ctx.arc(c.x, c.y, r, 0, Math.PI*2)
              //ctx.arc(200,200, r, 0, Math.PI*2)
             // ctx.stroke()
              ctx.fill()
              //console.error('jkjkj', c)
              ctx.fillStyle = 'red'
              
              ctx.font = '22px Arial'
              ctx.fillText(p.name, c[0]+11, c[1])
        

              return
            }

    }


    d(ob, p2, p3) {
        if (Array.isArray(ob) && ob[0]?.length === 3) {
          ob.forEach(t => this.dtr(t))
          return
        }
        if (Array.isArray(ob)) ob.forEach(e => this.d(e, p2, p3))
        if (ob?.type === 'line') this.dli(ob)
        if (ob?.type === 'point') this.dp(ob)
        if (ob?.type === 'seg') {
            this.ds22(ob, p2, p3)
        }
      }


    
      ds22(seg1, color, width) {
        let ctx = this.ctx


        if (seg1?.type) {

        }
        console.warn('ds ', seg1, color, width)
        ctx.beginPath()
        ctx.strokeStyle = (color ?? seg1.color) ?? 'black'

        ctx.lineWidth = width ?? 3
        if (seg1?.type) {
            let p1 = this.conv(seg1.pts[0])

            ctx.moveTo(p1.x, p1.y)
            for (let i = 1; i < seg1.pts.length; i++) {
                let p2 = this.conv(seg1.pts[i])

                ctx.lineTo(p2.x, p2.y)

            }

        } else {
            ctx.moveTo(this.conv(seg1[0]).x, this.conv(seg1[0]).y)
            ctx.lineTo(this.conv(seg1[1]).x, this.conv(seg1[1]).y)
        }
        ctx.stroke()
        //seg1?.ends?.forEach(p => d(p))

    }  

    dli(line1, color) {
        let ctx = this.ctx
        ctx.beginPath()
        ctx.lineWidth=1
        let c = color ?? 'black'
        ctx.fillStyle = c
        ctx.strokeStyle = c
        let cen = gc.lineCenter(line1)
        console.log('cen ', cen)
        //cen.x = 22; 
        //cen.y = 33
        let r = 11
        let cen1 = {type: 'point', x: cen.x + line1.a * r, y: cen.y +line1.b*r}
        let cenc = this.conv(cen)
        let cen1c = this.conv(cen1)
    
        let p1 = this.conv(gc.lineGetAbs(line1, {type: 'point', x: -800, y:0}))
        let p2 = this.conv(gc.lineGetAbs(line1, {type: 'point', x:  800, y:0}))
        console.log(p1, p2)
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cenc.x, cenc.y)
        ctx.lineTo(cen1c.x, cen1c.y)
        ctx.stroke()
    }

    dtr(tr, color) {
        let ctx = this.ctx
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = color ?? 'blue'
        let p1 = this.conv(tr[0])
        let p2 = this.conv(tr[1])
        let p3 = this.conv(tr[2])
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
    }
    




    int(ob1, ob2, options) {
        if (ob1.type === 'line' && ob2.type === 'line') {
            let d = ob1.a * ob2.b - ob1.b * ob2.a;
            return {
                type: 'point',
                x: (ob1.b * ob2.c - ob2.b * ob1.c) / d,
                y: (ob2.a * ob1.c - ob1.a * ob2.c) / d
            }
        }
        if (ob1.type === 'seg' && ob2.type === 'seg') {
            let li1 = this.line(ob1)
            let li2 = this.line(ob2)
            let p = this.int(li1, li2)
            let p11x = this.parPoint(li1, ob1.pts[0])
            let p12x = this.parPoint(li1, ob1.pts[1])
            let p21x = this.parPoint(li2, ob2.pts[0])
            let p22x = this.parPoint(li2, ob2.pts[1])
            let pi1 = this.parPoint(li1, p)
            let pi2 = this.parPoint(li2, p)
            if (
                options?.asLines ||
                (
                    ((p11x < pi1 && p12x > pi1) ||
                        (p11x > pi1 && p12x < pi1)) &&
                    ((p21x < pi2 && p22x > pi2) ||
                        (p21x > pi2 && p22x < pi2))
                )
            ) {
                return [p]
            } else {
                return []
            }
        }

    }

    mid(p1, p2) {
        return {
            type: 'point',
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        }
    }


    // input
    // line - determines coordinate system
    // wPoint - point in world coordinates
    lineGetRel(line, wPoint) {
        let c = this.lineCenter(line)
        let dx = wPoint.x - c.x
        // dx - -dx
        let dy = wPoint.y - c.y
        //  dy = -dy
        let x = -line.a * dy + line.b * dx;
        let y = line.a * dx + line.b * dy;
        return { type: "point", x, y }
    }
    lineCenter(line) {
        let x = -line.c * line.a;
        let y = -line.c * line.b;
        return { type: 'point', x, y }
    }
    lineGetAbs(line, lPoint) {
        let c = this.lineCenter(line);
        let dx = lPoint.y * line.a - lPoint.x * line.b;
        dx = lPoint.x * line.b + lPoint.y * line.a
        let dy = lPoint.y * line.b - lPoint.x * line.a
        let x = c.x + dx;
        let y = c.y + dy;
        return { type: 'point', x, y }
    }
    perPoint(line, point) {
        let r1 = this.lineGetRel(line, point)
        r1.y = 0
        let a2 = this.lineGetAbs(line, r1)
        return a2
    }
    pointPar(line, t) {
        // let r1 = this.lineGetRel(line, point)
        // r1.y = 0
        let a2 = this.lineGetAbs(line, { type: 'point', x: t, y: 0 })
        return a2
    }
    perLine(line, point) {
        let a = line.b;
        let b = - line.a;
        let l2 = { type: 'line', a, b, c: 0 }
        let pRelNew = this.lineGetRel(l2, point)
        l2.c = -pRelNew.y
        return l2
    }
    parPoint(line, p) {
        let pn = this.lineGetRel(line, p)
        return pn.x
    }


    line(p1, p2) {
        if (!p2) return this.line(p1.pts[0], p1.pts[1])
        let a = p1.y - p2.y
        let b = p2.x - p1.x
        let d = Math.sqrt(a * a + b * b)
        a = a / d; b = b / d;
        let c = (p1.x * p2.y - p2.x * p1.y) / d;
        return { type: 'line', a, b, c }
    }
    point(x, y) {
        //console.warn(this.pointCount, x, y)
        return {type: 'point', x, y, name: 'p' + this.pointCount++}
    }

    clone(ob) {
        if (ob.type === 'point') return {type: 'point', x: ob.x, y: ob.y}
        if (ob.type === 'seg') {
            let pts = []
            ob.pts.forEach((e, i) => {
                console.log('c i ', i, e)
                pts.push(this.clone(ob.pts[i]))
            })
            let rez = {
                type: 'seg',
                pts
            }
            if (ob.center) rez.center = this.clone(ob.center)
            return rez
        }
    }
    copy(obt, obs) {
        if (obt.type === 'point') {
            obt.x = obs.x
            obt.y = obs.y
        }
    }

    // sin (α + β) = sin α cos β + cos α sin β
    // cos (α + β) = cos α cos β – sin α sin β
    absLine(baseLine, line) {
        // a - sin, b - cos
        let a = baseLine.a * line.b + baseLine.b * line.a;
        let b = baseLine.b * line.b - baseLine.a * line.a;
        let rc = this.lineCenter(line)
        let ac = this.lineGetAbs(baseLine, rc)

        console.log('rc, ac ', rc, ac)

        let c = ac.x * a + ac.y * b
        return { type: 'line', a, b, c: -c }
    }

    // sin(α−β)=sinαcosβ−cosαsinβ
    // cos(α−β)=cosαcosβ+sinαsinβ
    relLine(baseLine, line) {
        // alpha - line
        // beta - baseLine
        let a = line.a * baseLine.b - line.b * baseLine.a;
        let b = line.b * baseLine.b + baseLine.a * line.a;
        let ac = this.lineCenter(line);
        let rc = this.lineGetRel(baseLine, ac)
        let c = rc.x * baseLine.a + rc.y * baseLine.b;
        c = rc.x * a + rc.y * b;
        return { type: 'line', a, b, c: -c }
    }

    shiftSeg(p1, p2, shift) {
        let line = this.line(p1, p2)
        let r1 = this.lineGetRel(line, p1)
        let r2 = this.lineGetRel(line, p2)
        line.c += shift
        let p1n = this.pointPar(line, r1.x)
        let p2n = this.pointPar(line, r2.x)
        return [p1n, p2n]
    }

    shiftPline(pline, shift) {
        if (this.isDebug) console.log(pline)
        let s2 = { type: 'seg', pts: [] }
        for (let i = 0; i < -pline.pts.length - 1; i++) {
            let p1 = pline.pts[i]
            let p2 = pline.pts[i + 1]
            let s = this.shiftSeg(p1, p2, shift)
            s2.pts.push(s[0])
            s2.pts.push(s[1])
        }
        let lastPoint
        let firstPoint

        let pts = pline.pts

        for (let i = 1; i < pline.pts.length - 1; i++) {

            let p1 = pline.pts[i - 1]
            let p2 = pline.pts[i]
            let p3 = pline.pts[i + 1]
            let s = this.shiftSeg(p1, p2)
            let [p1n, p2n] = this.shiftSeg(p1, p2, shift)
            let [p21n, p3n] = this.shiftSeg(p2, p3, shift)
            let li1 = this.line(p1n, p2n)
            let li2 = this.line(p21n, p3n)
            let p2i = this.int(li1, li2)
            if (i == 1) s2.pts.push(p1n)
            s2.pts.push(p2i)
            lastPoint = p3n

        }
        s2.pts.push(lastPoint)
        let pts2 = s2.pts
        if (pline.isClosed) {
            let p1 = pts2[0]
            let p2 = pts2[1]
            let p3 = pts2[pts2.length - 2]
            let p4 = pts2[pts2.length - 1]
            let pi = this.int(this.seg([p1, p2]), this.seg([p3, p4]), {asLines: true})
            this.copy(p1, pi[0])
            this.copy(p4, pi[0])
        }
        console.log('s2' ,s2)
        return s2
    }

    filletLines(line1, line2, r1p, r2p, limit1, limit2, npar) {
        console.log('nap ', npar)
        let n = npar ?? 15
        let r1 = r1p; let r2 = r2p
        let pi = this.int(line1, line2)
        let pir1, pir2, pari1, pari2, pir
        let pnts = []
        let lr1 = JSON.parse(JSON.stringify(line1))
        let lr2 = JSON.parse(JSON.stringify(line2));

        lr1 = JSON.parse(JSON.stringify(line1))
        lr2 = JSON.parse(JSON.stringify(line2));
        lr1.c -= r1
        lr2.c -= r2

        // center of circle
        pir = this.int(lr1, lr2)

        // projections of center
        pir1 = this.perPoint(line1, pir)
        pir2 = this.perPoint(line2, pir)


        if (limit1 && limit2) {

            // relative X
            pari1 = this.parPoint(line1, pi)
            pari2 = this.parPoint(line2, pi)
            let parC1 = this.parPoint(line1, pir)
            let parC2 = this.parPoint(line2, pir)

            // console.warn('limit ', limit1, limit2)
            // console.log('par int ', pari1, pari2)
            // console.log('par c ', parC1, parC2)

            let limitDist1 = Math.abs(pari1 - limit1)
            let limitDist2 = Math.abs(pari2 - limit2)
            let cenDist1 = Math.abs(pari1 - parC1)
            let cenDist2 = Math.abs(pari2 - parC2)
            if (
                Math.abs(limitDist1) < Math.abs(cenDist1) ||
                Math.abs(limitDist2) < Math.abs(cenDist2)
            ) {

                let maxPar = Math.max(cenDist1, cenDist2)
                let minLimit = Math.min(limitDist1, limitDist2)
                
                let ratio = minLimit / maxPar
                
                r1 *= ratio
                if (r1 === Infinity) debugger
                r2 *= ratio
                // console.log(r1)
            }
        }


        lr1 = JSON.parse(JSON.stringify(line1))
        lr2 = JSON.parse(JSON.stringify(line2));
        lr1.c -= r1
        lr2.c -= r2
        let r = Math.abs(r1)

        // center of circle
        pir = this.int(lr1, lr2)

        // projections of center
        pir1 = this.perPoint(line1, pir)
        pir2 = this.perPoint(line2, pir)

        let d1x = pir1.x - pir.x
        let d1y = pir1.y - pir.y
        let ang1 = Math.atan2(d1y, d1x) + Math.PI * 2
        let ang2 = Math.atan2(pir2.y - pir.y, pir2.x - pir.x) + Math.PI * 2

        
        let dang = ang2 - ang1

        // let dang = ang2 - ang1
        // if (dang > Math.PI * 2) {
        //     ang2 -= Math.PI * 2
        //     dang = ang2 - ang1
        // }


        // choose smallest angle        
        if (this.isDebug) {
            console.log('d ', d1x, d1y, r)
            console.log('ang ', ang1, ang2)
        }
        if (Math.abs(dang) > Math.PI ) {
            ang2 += -Math.PI  * 2 * Math.sign(dang)
            dang = ang2 - ang1
        }

//         let angSign = Math.sign(this.lineGetRel(line1, pir).y)
        
//         dang = ang2 - angSign * ang1
//         console.log('sign ', angSign, dang)
//         dang = this.normailzeAngle(dang) * angSign
// console.log('norm ', dang)





        for (let i = 0; i < n-1; i++) {

            let ang = ang1 + dang * i / (n -1)
            let dx = r * Math.cos(ang)
            let dy = r * Math.sin(ang)
            let x = pir.x + dx
            let y = pir.y + dy

            pnts.push({ type: 'point', x, y })
        }
        pnts.push(pir2)
        if (this.isDebug) console.log('rez ', pnts)
        return pnts
    }

    // make angle from 0 to 2*PI
    normailzeAngle(ang) {//return ang

        let rez = ang
        if (ang < 0) {
            rez += 2 * Math.PI
        }
        if (ang > 2 * Math.PI) rez -= 2 * Math.PI
        return rez
    }

    filletSeg(p1, p2, p3, p4, r, n) {
        let li1 = this.line(p1, p2)
        let li2 = this.line(p3, p4)
        // d([li1, li2])
        // direction of the circle center poistion
        
        let pr1 = this.lineGetRel(li1, p4)
        let pr2 = this.lineGetRel(li2, p1)

        if (this.isDebug) console.log(li1, li2, p1, p2, p3, p4)
        if (this.isDebug) console.log('rel ', pr1, pr2, r)
        let limit = null;
        //if (p2n) limit = this.lineGetRel(li1, p2n)

        let limit1 = this.lineGetRel(li1, this.mid(p1, p2))
        let limit2 = this.lineGetRel(li2, this.mid(p4, p3))

        let rez = this.filletLines(li1, li2,
            Math.sign(pr1.y) * r,
            Math.sign(pr2.y) * r,
            // limit?.x
            limit1.x, limit2.x,
            n
        )
        return rez
    }
    
    filletPoly(pline, r, n) {
        let isClosed = true
        let pts = pline.pts
        let pts2 = []
        let ends = []
        if (!isClosed) pts2.push(pline.pts[0])
        // let limit = pts[0]
        console.error('fillet poly ', r, pline)
        for (let i = 1; i < pts.length; i++) {
            let p1 = pts[i - 1]
            let p2 = pts[i]
            let p3 = pts[i + 1]
            if (isClosed && i === pts.length -1) p3 = pts[1]
            if (this.isDebug) console.error('pppppppppppppp ', i, p1, p2, p3)

            let lpts = this.filletSeg(p1, p2, p2, p3, r, n ?? 5)
            ends.push(lpts[Math.floor(lpts.length / 2)])
            if (lpts.length == 0) debugger
            lpts.forEach(p => pts2.push(p))
            // limit = lpts[lpts.length - 1]
        }
        if (!isClosed) {
            pts2.push(pline.pts[pts.length - 1])
        } else {
            pts2.push(this.clone(pts2[0]))
        }
        return { type: 'seg', pts: pts2, ends }
    }

    trimPoly(pline) {
        let n = 2 // look forward steps
        let r = 21
        let pts = pline.pts
        console.error('trim pline ', pline)
        for (let i=0; i<pts.length-n-2; i++) {
            if (this.isDebug) console.log('i ', i , pts.length, pts.length-n-2)
            for (let j=0; j<n; j++) {
                // console.log(', ', j)
                let p1 = pts[i]; let p2 = pts[i+1]
                let p3 = pts[i + 2 + j]; let p4 = pts[i+2 + j + 1]
                // console.log(p1, p2, p3, p4)
                let s1 = this.seg([pts[i], pts[i+1]])
                let s2 = this.seg([pts[i+2+j], pts[i+2+j+1]])

                let pi = this.int(s1, s2)
                if (pi.length) { // self intersection

                    this.copy(pts[i+1], pi[0])

                    this.copy(pts[i+2], pi[0])
                    let arc1 = this.filletSeg(
                        s1.pts[0], s1.pts[1], 
                        s2.pts[0], s2.pts[1], 
                        r, 2 + j)

                        
                    d(arc1)
                    this.copy(pts[i+1], arc1[0])
                    this.copy(pts[i+2], arc1[1])
                    //for (let k=0; k<j; k++) this.copy(pts[i+3 + k], pi[0])
                    for (let k=0; k<j; k++) this.copy(pts[i+3 + k], arc1[2 + k])
                    // pts[i+1].x = pi[0].x
                    // pts[i+1].y = pi[0].y
                    i = i+j + 1
                    j=n

                    if (this.isDebug) console.error('found int ', i, j)
                    if (this.isDebug) console.log('arc ', arc1)
                }
            } // j
            // console.log('eeee ', i)
        }
    }

    triangles(pline1, pline2) {
        let pts1 = pline1.pts
        let pts2 = pline2.pts
        let trs = []
        for (let i = 0; i < pts1.length - 1; i++) {
            let tri1 = [gc.clone(pts1[i]), gc.clone(pts1[i + 1]), gc.clone(pts2[i])]
            let tri2 = [gc.clone(pts1[i + 1]), gc.clone(pts2[i]), gc.clone(pts2[i + 1])]
            // console.log(i, tri1, pline1)
            trs.push(tri1)
            trs.push(tri2)
        }
        return trs
    }
    triangles1(pline, pInt) {
        let trs = []
        for (let i=0; i<pline.pts.length-1; i++) {
            let pt = pline.pts[i]
            let pt2 = pline.pts[i+1]
            trs.push([
                this.clone(pt), this.clone(pt2), this.clone(pInt)
            ])
        }
        
        return trs
    }
    trianglesMakeIndexed(trs, offset) {
        let pts = []
        let indices = []
        let intCount = isNaN(offset) ? 0 : offset
        for (let i=0; i<trs.length; i++) {
            let tr = trs[i]
            pts.push(tr[0])
            pts.push(tr[1])
            pts.push(tr[2])
            indices.push(intCount++)
            indices.push(intCount++)
            indices.push(intCount++)
        }
        return {pts, indices}
    }
    move(ob, shift) {
        // console.log('move ', ob)
        if (this.isDebug) console.log('move ', ob)
        if (Array.isArray(ob)) {
          ob.forEach(e => this.move(e, shift))
          return
        }
        if (ob.type === 'seg') {
            ob.pts.forEach(p => this.move(p, shift))
            if (ob.center) this.move(ob.center, shift)
        }
        if (ob.type === 'point') {
            ob.x += shift.x
            ob.y += shift.y
        }
    }
    rotate(ob, angle, center) {
        if (Array.isArray(ob)) {
            console.log('ar rot')
            ob.forEach(e => this.rotate(e, angle, center))
            return
          }
        if (ob.type === 'point') {            
            let p2 = this.clone(ob)
            if (center) {
                p2.x -= center.x
                p2.y -= center.y
            }
            let p2n = this.point(0, 0)
            p2n.x = p2.x * Math.cos(angle) - p2.y * Math.sin(angle)
            p2n.y = p2.y * Math.cos(angle) + p2.x * Math.sin(angle)
            if (center) {
                p2n.x += center.x
                p2n.y += center.y
            }
            ob.x = p2n.x
            ob.y = p2n.y            
            return p2n
        }
        if (ob.type === 'seg') {
            let pts = []
            ob.pts.forEach(p => {
                pts.push(this.rotate(p, angle, center))
            })
            return {type: 'seg', pts}
        }
    }
    mirrow(pline) {
        let pts = pline.pts
        let pts2 = []
        for (let i=0; i<pts.length; i++) {
            pts2.push(pts[i])
        }
        for (let i=pts.length-1; i>=0; i--) {
            let pm = this.clone(pts[i])
            pm.x = -pm.x
            pts2.push(pm)
        }
        console.log('mirrow ', pts2)
        return {type: 'seg', pts: pts2}
    }

    seg(a) {
        return { type: 'seg', pts: a }
    }

}


let gc = new GeomCore();