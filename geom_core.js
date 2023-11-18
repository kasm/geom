/**
 * Created by Dima on 04.01.2018.
 */

class GeomCore {
    eps = .000001
    constructor(width, height) {
        this.width = width
        this.height = height
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
    int(ob1, ob2) {
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
                ((p11x < pi1 && p12x > pi1) ||
                    (p11x > pi1 && p12x < pi1)) &&
                ((p21x < pi2 && p22x > pi2) ||
                    (p21x > pi2 && p22x < pi2))
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
        let r1 = this.lineGetRel(line, point)
        r1.y = 0
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
        let a = p1.y - p2.y
        let b = p2.x - p1.x
        let d = Math.sqrt(a * a + b * b)
        a = a / d; b = b / d;
        let c = (p1.x * p2.y - p2.x * p1.y) / d;
        return { type: 'line', a, b, c }
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
        console.log(pline)
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
        return s2
    }
    filletLines(line1, line2, r1p, r2p, limit1, limit2) {
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

            console.warn('limit ', limit1, limit2)
            console.log('par int ', pari1, pari2)
            console.log('par c ', parC1, parC2)

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
                console.log(r1)
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
        console.log('d ', d1x, d1y)
        let ang1 = Math.atan2(d1y, d1x) + Math.PI * 2
        let ang2 = Math.atan2(pir2.y - pir.y, pir2.x - pir.x) + Math.PI * 2
        let dang = ang2 - ang1
        if (dang > Math.PI) {
            ang2 -= Math.PI * 2
            dang = ang2 - ang1
        }
        let n = 5
        for (let i = 0; i < n; i++) {

            let ang = ang1 + dang * i / n 
            let dx = r * Math.cos(ang)
            let dy = r * Math.sin(ang)
            let x = pir.x + dx
            let y = pir.y + dy

            pnts.push({ type: 'point', x, y })
        }
        pnts.push(pir2)
        console.log('rez ', pnts)
        return pnts
    }

    filletSeg(p1, p2, p3, p4, r, p2n) {
        let li1 = this.line(p1, p2)
        let li2 = this.line(p3, p4)
        // direction of the circle center poistion
        let pr1 = this.lineGetRel(li1, p4)
        let pr2 = this.lineGetRel(li2, p1)
        let limit = null;
        if (p2n) limit = this.lineGetRel(li1, p2n)

        let limit1 = this.lineGetRel(li1, this.mid(p1, p2))
        let limit2 = this.lineGetRel(li2, this.mid(p4, p3))

        let rez = this.filletLines(li1, li2,
            Math.sign(pr1.y) * r,
            Math.sign(pr2.y) * r,
            // limit?.x
            limit1.x, limit2.x
        )
        return rez
    }
    
    filletPoly(pline, r) {
        let pts = pline.pts
        let pts2 = []
        pts2.push(pline.pts[0])
        let limit = pts[0]
        for (let i = 1; i < pts.length - 1; i++) {
            let p1 = pts[i - 1]
            let p2 = pts[i]
            let p3 = pts[i + 1]
            console.error('pppppppppppppp ', i, p1, p2, p3)
            let li1 = this.line(p1, p2)
            let li2 = this.line(p2, p3)
            // let lpts = this.filletLines(li1, li2, 22)
            let lpts = this.filletSeg(p1, p2, p2, p3, r, limit)
            if (lpts.length == 0) debugger
            lpts.forEach(p => pts2.push(p))
            limit = lpts[lpts.length - 1]
        }
        pts2.push(pline.pts[pts.length - 1])
        return { type: 'seg', pts: pts2 }
    }
    triangles(pline1, pline2) {
        let pts1 = pline1.pts
        let pts2 = pline2.pts
        let trs = []
        for (let i = 0; i < pts1.length - 1; i++) {
            let tri1 = [pts1[i], pts1[i + 1], pts2[i]]
            let tri2 = [pts1[i + 1], pts2[i], pts2[i + 1]]
            console.log(i, tri1, pline1)
            trs.push(tri1)
            trs.push(tri2)
        }
        return trs
    }
    seg(a) {
        return { type: 'seg', pts: a }
    }



}


