/**
 * Created by Dima Rukavishnikov on 04.01.2018.
 * updated: November 2023 (add fill polylines and triangulationo)
 */

 class GeomObject {}

let d

 class GeomCore {
  eps = 0.0000000001
  isDebug = true
  isCanvas = true
  width = 600
  height = 600
  constructor(width, height) {
    if (this.isDebug) console.error("CTOR")
    this.width = width ?? 600
    this.height = height ?? 600
    if (this.isCanvas) this.initCanvas()
  }

  conv(p) {
    let scale = 73
    if (p?.type === "point") {
      return {
        type: "point",
        x: p.x * scale + this.width / 2,
        y: this.height / 2 - p.y * scale + 180
      }
    }
    return { type: "point", x: 0, y: 0 }
  }

  initCanvas() {
    let body = document.querySelector("body")
    let oldCanv = document.getElementById("geomCanv")
    if (oldCanv) body.removeChild(oldCanv)
    if (!this.isCanvas) return

    let canv = document.createElement("canvas")
    this.canvas = canv
    this.ctx = canv.getContext("2d")
    canv.width = this.width
    canv.height = this.height
    canv.style.position = "fixed"
    canv.style.zIndex = "99999"
    canv.style.width = "600px"
    canv.style.height = "600px"
    canv.style.left = "0px"
    canv.style.top = "0px"
    canv.style.border = "1px solid red"
    canv.style.pointerEvents = "none"
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(111, 211)
    this.ctx.stroke()

    canv.id = "geomCanv"
    document.querySelector("body").appendChild(canv)
    d = this.d.bind(this)
    this.drawAxis()
  }

  clearRect() {
    if (!this.isCanvas) return
    this.ctx.clearRect(0, 0, 600, 600)
  }

  drawAxis() {
    d({ type: "line", a: 1, b: 0, c: 0 })
    d({ type: "line", a: 0, b: 1, c: 0 })
  }

  dp(p, color, comment, r1) {
    let r = r1 ?? 2
    let ctx = this.ctx
    ctx.moveTo(0, 0)
    ctx.lineTo(111, 111)
    ctx.stroke()
    let col = color ?? p.color ?? "black"
    //c = c ?? 'black'
    if (p?.type === "point") {
      ctx.beginPath()
      ctx.fillStyle = col
      ctx.strokeStyle = col
      let c = this.conv(p)

      ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
      ctx.fill()
      let text = comment ?? p.name + ":" + p.options?.i
      ctx.fillStyle = "red"
      ctx.font = "12px Arial"
      ctx.fillText(text, c.x + 3, c.y - 1)
      return
    }
  }

  d(ob, p2, p3, p4) {
    if (!this.isCanvas) return
    if (Array.isArray(ob) && ob[0]?.length === 3) {
      ob.forEach(t => this.dtr(t))
      return
    }
    if (Array.isArray(ob)) ob.forEach(e => this.d(e, p2, p3))
    if (ob?.type === "line") this.dli(ob)
    if (ob?.type === "point") this.dp(ob, p2, p3, p4)
    if (ob?.type === "seg") this.ds(ob, p2, p3)
  }

  ds(seg1, color, width) {
    let ctx = this.ctx

    ctx.beginPath()
    ctx.strokeStyle = color ?? seg1.color ?? "black"

    ctx.lineWidth = width ?? 1
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
    this.d(seg1.pts)
    if (seg1.center) this.d(seg1.center, "red", "", 8)
    //seg1?.ends?.forEach(p => d(p))
  }

  dli(line1, color) {
    let ctx = this.ctx
    ctx.beginPath()
    ctx.lineWidth = 1
    let c = color ?? "black"
    ctx.fillStyle = c
    ctx.strokeStyle = c
    let cen = this.lineCenter(line1)

    let r = 11
    let cen1 = { type: "point", x: cen.x + line1.a * r, y: cen.y + line1.b * r }
    let cenc = this.conv(cen)
    let cen1c = this.conv(cen1)

    let p1 = this.conv(this.lineGetAbs(line1, { type: "point", x: -800, y: 0 }))
    let p2 = this.conv(this.lineGetAbs(line1, { type: "point", x: 800, y: 0 }))
    // console.log(p1, p2)
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
    ctx.strokeStyle = color ?? "blue"
    let p1 = this.conv(tr[0])
    let p2 = this.conv(tr[1])
    let p3 = this.conv(tr[2])
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
  }

  line(p1, p2) {
    if (!p2) {
      if (!p1.pts) {
        debugger
      }
      return this.line(p1.pts[0], p1.pts[1])
    }

    let a = p1.y - p2.y
    let b = p2.x - p1.x
    let d = Math.sqrt(a * a + b * b)
    a = a / d
    b = b / d
    let c = (p1.x * p2.y - p2.x * p1.y) / d
    return { type: "line", a, b, c, options: {} }
  }

  point(x, y, options, name) {
    let rez
    let opts = options ?? {}
    rez = { type: "point", x, y, options: opts }
    rez.name = name
    return rez
  }

  copy(obt, obs) {
    if (obt.type === "point") {
      obt.x = obs.x
      obt.y = obs.y
      this.copyOptions(obt, obs)
    }
  }

  seg(a) {
    return {
      type: "seg",
      pts: a,
      options: {}
    }
  }

  int(ob1, ob2, options) {
    if (ob1.type === "line" && ob2.type === "line") {
      let d = ob1.a * ob2.b - ob1.b * ob2.a
      return {
        type: "point",
        x: (ob1.b * ob2.c - ob2.b * ob1.c) / d,
        y: (ob2.a * ob1.c - ob1.a * ob2.c) / d
      }
    }

    //                                            OLD INTERSECTION WORKING
    // if (ob1.type === 'seg' && ob2.type === 'seg') {
    //   let li1 = this.line(ob1)
    //   let li2 = this.line(ob2)
    //   // console.log('int lines ', li1, li2)
    //   let p = this.int(li1, li2)
    //   let p11x = this.parPoint(li1, ob1.pts[0])
    //   let p12x = this.parPoint(li1, ob1.pts[1])
    //   let p21x = this.parPoint(li2, ob2.pts[0])
    //   let p22x = this.parPoint(li2, ob2.pts[1])

    //   // rel X of lines intersection
    //   let pi1 = this.parPoint(li1, p)
    //   let pi2 = this.parPoint(li2, p)

    //   // is line1 intersects body of ob2
    //   let line1int = ((p21x < pi2 && p22x > pi2) || (p21x > pi2 && p22x < pi2))
    //   let line2int = ((p11x < pi1 && p12x > pi1) || (p11x > pi1 && p12x < pi1))

    //   if (
    //     options?.asLines ||
    //     (
    //       ((p11x < pi1 && p12x > pi1) ||
    //         (p11x > pi1 && p12x < pi1)) &&
    //       ((p21x < pi2 && p22x > pi2) ||
    //         (p21x > pi2 && p22x < pi2))
    //     )
    //   ) {
    //     return [p]
    //   } else {
    //     return []
    //   }

    // }

    if (ob1.type === "seg" && ob2.type === "seg") {
      let li1 = this.line(ob1)
      let li2 = this.line(ob2)
      // console.log('int lines ', li1, li2)
      let p = this.int(li1, li2)
      let p11x = this.parPoint(li1, ob1.pts[0])
      let p12x = this.parPoint(li1, ob1.pts[1])
      let p21x = this.parPoint(li2, ob2.pts[0])
      let p22x = this.parPoint(li2, ob2.pts[1])

      // rel X of lines intersection
      let pi1 = this.parPoint(li1, p)
      let pi2 = this.parPoint(li2, p)

      // let rpi1 = this.lineGetRel(li1, p)
      // let rpi2 = this.lineGetRel(li2, p)
      // if (Math.abs(rpi1.y) < this.eps) {
      //   console.error('zzzzzzzzzz ', rpi1)
      // }

      // is line1 intersects body of ob2
      let line1int = (p21x < pi2 && pi2 < p22x) || (p21x > pi2 && pi2 > p22x)
      let line2int = (p11x < pi1 && pi1 < p12x) || (p11x > pi1 && pi1 > p12x)

      if (options?.asLines) return [p]
      if (options?.asLine1 && line1int) return [p]
      if (options?.asLine2 && line2int) return [p]
      if (line1int && line2int) return [p]
      return []
    }

    return null
  }

  mid(p1, p2) {
    return {
      type: "point",
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    }
  }

  // input
  // line - determines coordinate system
  // wPoint - point in world coordinates
  lineGetRel(line, wPoint) {
    //                          CLASSIC BUT SLOW
    // let c = this.lineCenter(line)
    // let dx = wPoint.x - c.x
    // dx - -dx
    // let dy = wPoint.y - c.y
    // dy = -dy

    //                          NEW FASTER
    let dx = wPoint.x + line.c * line.a
    let dy = wPoint.y + line.c * line.b

    let x = -line.a * dy + line.b * dx
    let y = line.a * dx + line.b * dy
    return { x, y }
  }

  lineCenter(line) {
    let x = -line.c * line.a
    let y = -line.c * line.b
    return { type: "point", x, y }
  }

  lineGetAbs(line, lPoint) {
    let c = this.lineCenter(line)
    let dx = lPoint.y * line.a - lPoint.x * line.b
    dx = lPoint.x * line.b + lPoint.y * line.a
    let dy = lPoint.y * line.b - lPoint.x * line.a
    let x = c.x + dx
    let y = c.y + dy
    let rez = { type: "point", x, y }
    return rez
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
    let a2 = this.lineGetAbs(line, { type: "point", x: t, y: 0 })
    return a2
  }

  perLine(line, point) {
    let a = line.b
    let b = -line.a
    let l2 = { type: "line", a, b, c: 0 }
    let pRelNew = this.lineGetRel(l2, point)
    l2.c = -pRelNew.y
    return l2
  }

  parPoint(line, p) {
    let pn = this.lineGetRel(line, p)
    return pn.x
  }

  // sin (α + β) = sin α cos β + cos α sin β
  // cos (α + β) = cos α cos β – sin α sin β
  absLine(baseLine, line) {
    // a - sin, b - cos
    let a = baseLine.a * line.b + baseLine.b * line.a
    let b = baseLine.b * line.b - baseLine.a * line.a
    let rc = this.lineCenter(line)
    let ac = this.lineGetAbs(baseLine, rc)

    let c = ac.x * a + ac.y * b
    return { type: "line", a, b, c: -c }
  }

  // sin(α−β)=sinαcosβ−cosαsinβ
  // cos(α−β)=cosαcosβ+sinαsinβ
  relLine(baseLine, line) {
    // alpha - line
    // beta - baseLine
    let a = line.a * baseLine.b - line.b * baseLine.a
    let b = line.b * baseLine.b + baseLine.a * line.a
    let ac = this.lineCenter(line)
    let rc = this.lineGetRel(baseLine, ac)
    let c = rc.x * baseLine.a + rc.y * baseLine.b
    c = rc.x * a + rc.y * b
    return { type: "line", a, b, c: -c }
  }

  shiftSeg(p1, p2, shift) {
    let line = this.line(p1, p2)
    let r1 = this.lineGetRel(line, p1)
    let r2 = this.lineGetRel(line, p2)
    line.c += shift
    let p1n = this.pointPar(line, r1.x)
    let p2n = this.pointPar(line, r2.x)
    this.copyOptions(p1n, p1)
    p1n.name = p1.name
    this.copyOptions(p2n, p2)
    p2n.name = p2.name
    return [p1n, p2n]
  }

  copyOptions(target, source) {
    if (source.options)
      target.options = JSON.parse(JSON.stringify(source.options))
  }

  shiftPline(pline, shift) {
    if (this.isDebug) console.log(pline)
    let s2 = { type: "seg", pts: [], options: {} }
    if (pline.bRads) s2.bRads = []
    //   for (let i = 0; i < -pline.pts.length - 1; i++) {
    //       let p1 = pline.pts[i]
    //       let p2 = pline.pts[i + 1]
    //       let s = this.shiftSeg(p1, p2, shift)
    //       s2.pts.push(s[0])
    //       s2.pts.push(s[1])
    //   }
    let lastPoint
    let firstPoint

    for (let i = 1; i < pline.pts.length - 1; i++) {
      let p1 = pline.pts[i - 1]
      let p2 = pline.pts[i]
      let p3 = pline.pts[i + 1]
      // let s = this.shiftSeg(p1, p2)
      let [p1n, p2n] = this.shiftSeg(p1, p2, shift)
      let [p21n, p3n] = this.shiftSeg(p2, p3, shift)
      let li1 = this.line(p1n, p2n)
      let li2 = this.line(p21n, p3n)
      let p2i = this.int(li1, li2)
      this.copyOptions(p2i, p2)
      p2i.name = p2.name
      if (i == 1) {
        s2.pts.push(p1n)
        if (pline.bRads) s2.bRads.push(pline.bRads[0])
      }

      s2.pts.push(p2i)
      lastPoint = p3n
      if (pline.bRads) s2.bRads.push(pline.bRads[i])
    }
    // s2.bRads.push(pline.bRads[pline.pts.length - 1])

    let pts2 = s2.pts
    if (pline.isClosed) {
      s2.pts.push(lastPoint)

      if (this.isDebug) console.warn("shift closed", s2.pts)
      // debugger
      s2.isClosed = true
      let p1 = pts2[0]
      let p2 = pts2[1]
      let p3 = pts2[pts2.length - 2]
      let p4 = pts2[pts2.length - 1]
      let pi = this.int(this.seg([p1, p2]), this.seg([p3, p4]), {
        asLines: true
      })[0]
      this.copyOptions(pi, p1)
      pi.name = p1.name
      this.copy(p1, pi)
      this.copy(p4, pi)

      // s2.pts.push(pi)
    } else {
      s2.pts.push(lastPoint)
    }

    return s2
  }

  trimPoly(pline, lookForward) {
    let n = lookForward ?? 2 // look forward steps
    let r = 21
    let pts = pline.pts
    if (this.isDebug) console.error("trim pline ", pline)
    for (let i = 0; i < pts.length - n - 2; i++) {
      if (this.isDebug) console.log("i ", i, pts.length, pts.length - n - 2)
      for (let j = 0; j < n; j++) {
        // console.log(', ', j)
        let p1 = pts[i]
        let p2 = pts[i + 1]
        let p3 = pts[i + 2 + j]
        let p4 = pts[i + 2 + j + 1]
        // console.log(p1, p2, p3, p4)
        let s1 = this.seg([pts[i], pts[i + 1]])
        let s2 = this.seg([pts[i + 2 + j], pts[i + 2 + j + 1]])

        let pi = this.int(s1, s2)
        if (pi.length) {
          // self intersection

          this.copy(pts[i + 1], pi[0])

          this.copy(pts[i + 2], pi[0])
          let arc1 = this.filletSeg(
            s1.pts[0],
            s1.pts[1],
            s2.pts[0],
            s2.pts[1],
            r,
            2 + j
          )

          this.copy(pts[i + 1], arc1[0])
          this.copy(pts[i + 2], arc1[1])
          //for (let k=0; k<j; k++) this.copy(pts[i+3 + k], pi[0])
          for (let k = 0; k < j; k++) this.copy(pts[i + 3 + k], arc1[2 + k])
          // pts[i+1].x = pi[0].x
          // pts[i+1].y = pi[0].y
          i = i + j + 1
          j = n

          if (this.isDebug) console.error("found int ", i, j)
          if (this.isDebug) console.log("arc ", arc1)
        }
      } // j
    }
  }

  filletWithTrimOrig(pline, r1, r2, shift, n) {
    let shift2 = this.shiftPline(pline, shift)

    let fil1 = this.filletPoly(pline, r1, n)
    if (this.isDebug) console.log("fil1 ", fil1)

    let fil2 = this.shiftPline(fil1, shift)
    fil2.origPts = shift2.pts
    if (this.isDebug) console.log("fil2 ", fil2)
    this.trimPolyByOrig(fil2, 2)
    return [fil1, fil2]
  }

  // trim self intersection of fillet poly with original (not trimmed)
  // trimPolyByOrig ( pline, GeomObject, lookForward?: number ) {
  trimPolyByOrig(pline, lookForward) {
    let n = lookForward ?? 2 // look forward steps
    let r = 21

    let pts = pline.pts
    let opts = pline.origPts
    if (this.isDebug) console.error("trim pline ", pline)
    // for (let i = 0; i < pts.length - n - 2; i++) {
    for (let i = 0; i < pts.length - n - 3; i++) {
      // let dd = 1; for (let i = dd; i < dd+1; i++) {
      // console.log('i ', i, pts.length, pts.length - n - 2)
      for (let j = 0; j < n - 1; j++) {
        // for (let j = 0; j < 2; j++) {
        // console.log('i, j ', i, j)
        let p1 = pts[i]
        let p2 = pts[i + 1]
        let p3 = pts[i + 2 + j]
        let p4 = pts[i + 2 + j + 1]
        // console.log(p1, p2, p3, p4)

        let s1 = this.seg([pts[i], pts[i + 1]])
        let pi1 = pts[i].options.i - 1
        // console.log('pi1, j opts', pi1, j, opts)
        // let s2 = this.seg([pts[i + 2 + j], pts[i + 2 + j + 1]])
        let oi1 = (pi1 + 1 + j) % opts.length
        let oi2 = (pi1 + 1 + j + 1) % opts.length
        let s2 = this.seg([opts[oi1], opts[oi2]])
        if (i == 1111) {
          this.d(s1, "green", 5)
          this.d(s2, "red", 5)
        }

        // console.log('s1 s2 ', s1, s2)
        let pi = this.int(s1, s2, { asLine2: true })
        if (pi.length) {
          // self intersection

          if (this.isDebug) console.log("oi2 ", oi2)
          this.d(s1, "green", 5)
          this.d(s2, "red", 5)
          // this.d(pi[0], 'blue')
          let k = i + 0
          if (this.isDebug)
            console.warn("self int ", k, pts[k].options.i, pi[0])
          // while ( oi2 + 1 > pts[ k ].options.i + 333 ) {
          console.log(k)
          if (!pts[k]?.options) {
            debugger
          }
          console.log(pts[k])

          while (!!pts[k] && oi2 + 1 > pts[k].options.i) {
            // this.d([pts[k], pi[0]], 'blue', 5)
            if (this.isDebug) console.warn("while k", k, pts[k])
            this.copy(pts[k], pi[0])
            pts[k].y = 0
            k++
          }
          i = i + k

          // this.copy(pts[i + 1], pi[0])

          // this.copy(pts[i + 2], pi[0])
          // let arc1 = this.filletSeg(
          //   s1.pts[0], s1.pts[1],
          //   s2.pts[0], s2.pts[1],
          //   r, 2 + j)

          // this.copy(pts[i + 1], arc1[0])
          // this.copy(pts[i + 2], arc1[1])
          // //for (let k=0; k<j; k++) this.copy(pts[i+3 + k], pi[0])
          // for (let k = 0; k < j; k++) this.copy(pts[i + 3 + k], arc1[2 + k])
          // // pts[i+1].x = pi[0].x
          // // pts[i+1].y = pi[0].y

          // i = i + j + 1

          if (isNaN(i)) debugger
          j = n

          if (this.isDebug) console.error("found int ", i, j)
          // if (this.isDebug) console.log('arc ', arc1)
        } // pi.length
      } // j
    }
  } // trim poly by orig

  filletLines(line1, line2, r1p, r2p, limit1, limit2, npar, options) {
    let n = npar ?? 15
    let r1 = r1p
    let r2 = r2p
    let pi = this.int(line1, line2)
    let pir1, pir2, pari1, pari2, pir
    let pnts = []
    let lr1 = JSON.parse(JSON.stringify(line1))
    let lr2 = JSON.parse(JSON.stringify(line2))

    lr1 = JSON.parse(JSON.stringify(line1))
    lr2 = JSON.parse(JSON.stringify(line2))

    if (n <= 0) return { pnts: [this.int(lr1, lr2)], r: 0 }
    lr1.c -= r1
    lr2.c -= r2

    // center of circle
    pir = this.int(lr1, lr2)

    // projections of center
    pir1 = this.perPoint(line1, pir)
    pir2 = this.perPoint(line2, pir)

    if (this.isDebug)
      console.log("FILLET LINES: lims, rads: ", limit1, limit2, r1p, r2p)

    if (typeof limit1 === "number" && typeof limit2 === "number") {
      // relative X
      pari1 = this.parPoint(line1, pi)
      pari2 = this.parPoint(line2, pi)
      let parC1 = this.parPoint(line1, pir)
      let parC2 = this.parPoint(line2, pir)

      //   console.warn('limit ', limit1, limit2)
      //   console.log('par int ', pari1, pari2)
      //   console.log('par c ', parC1, parC2)

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
      }
    }

    lr1 = JSON.parse(JSON.stringify(line1))
    lr2 = JSON.parse(JSON.stringify(line2))
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
    if (this.isDebug) console.log("d ", d1x, d1y)
    let ang1 = Math.atan2(d1y, d1x) + Math.PI * 2
    let ang2 = Math.atan2(pir2.y - pir.y, pir2.x - pir.x) + Math.PI * 2
    let dang = ang2 - ang1
    //   if (dang > Math.PI) {
    //       ang2 -= Math.PI * 2
    //       dang = ang2 - ang1
    //   }

    // choose smallest angle
    if (Math.abs(dang) > Math.PI) {
      ang2 += -Math.PI * 2 * Math.sign(dang)
      dang = ang2 - ang1
    }

    for (let i = 0; i < n; i++) {
      let ang = ang1 + (dang * i) / n
      let dx = r * Math.cos(ang)
      let dy = r * Math.sin(ang)
      let x = pir.x + dx
      let y = pir.y + dy

      pnts.push({ type: "point", x, y, options: {} })
    }
    pnts.push(pir2)
    if (this.isDebug) console.log("rez ", pnts)
    return { pnts, r }

    // if (options?.getR) return {pnts, r}
    // return pnts
  } // fillet lines

  filletSeg(p1, p2, p3, p4, r, n, options) {
    let li1 = this.line(p1, p2)
    let li2 = this.line(p3, p4)

    // direction of the circle center poistion
    let pr1 = this.lineGetRel(li1, p4)
    let pr2 = this.lineGetRel(li2, p1)

    let limit1 = this.lineGetRel(li1, this.mid(p1, p2))
    let limit2 = this.lineGetRel(li2, this.mid(p4, p3))

    let rez = this.filletLines(
      li1,
      li2,
      Math.sign(pr1.y) * r,
      Math.sign(pr2.y) * r,
      limit1.x,
      limit2.x,
      n,
      options
    )
    return rez
    if (options?.getR) return rez

    return rez
  }

  filletPoly(pline, r, n) {
    if (this.isDebug) console.warn("FILLET POLY", pline, r)
    let isClosed = true
    let pts = pline.pts
    // pline.origPts = pts
    let pts2 = []
    let ends = []
    let rads = []
    if (!isClosed) pts2.push(pline.pts[0])

    for (let i = 1; i < pts.length; i++) {
      let p1 = pts[i - 1]
      let p2 = pts[i]
      let p3 = pts[i + 1]
      if (isClosed && i === pts.length - 1) {
        p3 = pts[1]
      }

      let isRad = !!pline.bRads
      isRad = !!p2.options.bRad
      let filletRez = this.filletSeg(
        p1,
        p2,
        p2,
        p3, // isRad ? pline.bRads[i] * r : r,
        // pline.bRads[i] > 0 ? n : -1
        isRad ? p2.options.bRad * r : r,
        isRad && p2.options.bRad > 0 ? n : -1,
        { getR: true }
      )
      rads.push(filletRez.r)
      let lpts = filletRez.pnts
      let odd = lpts.length % 2
      if (odd === 1) {
        ends.push(lpts[Math.floor(lpts.length / 2)])
      } else {
        let p1 = lpts[Math.floor(lpts.length / 2) - 1]
        let i2 = Math.floor(lpts.length / 2) + 0
        if (lpts.length === 1) i2 = 0
        let p2 = this.clone(lpts[i2])
        p2.options.i = i
        let x = (p1.x + p2.x) / 2
        let y = (p1.y + p2.y) / 2
        let p = this.point(x, y)
        ends.push(p)
      }

      if (lpts.length == 0) debugger
      lpts.forEach((p, ii) => {
        this.copyOptions(p, p2)
        p.name = p2.name + "_" + ii
        p.options.i = i
        pts2.push(p)
      })
      //   limit = lpts[lpts.length - 1]
    }

    if (!isClosed) {
      pts2.push(pline.pts[pts.length - 1])
    } else {
      pts2.push(this.clone(pts2[0]))
    }

    let rez = {
      type: "seg",
      pts: pts2,
      ends,
      center: pline.center,
      options: { rads }
    }
    rez.origPts = pts.map(e => this.clone(e))
    rez.isClosed = isClosed
    return rez
  } // fillet poly

  triangles(pline1, pline2) {
    let pts1 = pline1.pts
    let pts2 = pline2.pts
    let trs = []
    for (let i = 0; i < pts1.length - 1; i++) {
      //   let tri1 = [pts1[i], pts1[i + 1], pts2[i]]
      //   let tri2 = [pts1[i + 1], pts2[i], pts2[i + 1]]
      let tri1 = [
        this.clone(pts1[i]),
        this.clone(pts1[i + 1]),
        this.clone(pts2[i])
      ]
      let tri2 = [
        this.clone(pts1[i + 1]),
        this.clone(pts2[i]),
        this.clone(pts2[i + 1])
      ]
      //   tri1[0] = tri1[2]
      //   tri2[0] = tri2[2]
      // console.log(i, tri1, pline1)
      trs.push(tri1)
      trs.push(tri2)
    }
    return trs
  }

  triangles1(pline, pInt) {
    let trs = []
    for (let i = 0; i < pline.pts.length - 1; i++) {
      let pt = pline.pts[i]
      let pt2 = pline.pts[i + 1]
      trs.push([
        this.clone(pt),
        this.clone(pt2),
        this.clone(pInt ?? pline.center)
      ])
    }
    return trs
  }

  trianglesMakeIndexed(trs, offset) {
    let pts = []
    let indices = []
    let intCount = isNaN(offset) ? 0 : offset
    for (let i = 0; i < trs.length; i++) {
      let tr = trs[i]
      pts.push(tr[0])
      pts.push(tr[1])
      pts.push(tr[2])
      indices.push(intCount++)
      indices.push(intCount++)
      indices.push(intCount++)
    }
    return { pts, indices }
  }

  move(ob, shift) {
    // if (this.isDebug) console.log('move ', ob)
    if (Array.isArray(ob)) {
      ob.forEach(e => this.move(e, shift))
      return
    }
    if (ob.type === "seg") {
      ob.pts.forEach(p => this.move(p, shift))
      if (ob.center) {
        this.move(ob.center, shift)
      }
    }
    if (ob.type === "point") {
      ob.x += shift.x
      ob.y += shift.y
    }
  }

  rotate(
    ob,
    angle,
    center = {
      type: "point",
      x: 0,
      y: 0
    }
  ) {
    if (Array.isArray(ob)) {
      ob.forEach(e => this.rotate(e, angle, center))
      return
    }

    if (ob.type === "point") {
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
      return
    }

    if (ob.type === "seg") {
      let pts = []
      ob.pts.forEach(p => {
        //   pts.push(this.rotate(p, angle, center))
        this.rotate(p, angle, center)
      })

      if (ob.center) {
        this.rotate(ob.center, angle, center)
      }
      return //{type: 'seg', pts}
    }
    return //ob
  }

  mirrow(pline) {
    let pts = pline.pts
    let pts2 = []
    let bRads2 = []
    for (let i = 0; i < pts.length; i++) {
      pts2.push(pts[i])
      if (pline.bRads) bRads2.push(pline.bRads[i])
    }

    for (let i = pts.length - 1; i >= 0; i--) {
      let pm = this.clone(pts[i])
      pm.x = -pm.x
      pm.name = pts[i].name + "w"
      pts2.push(pm)
      if (pline.bRads) bRads2.push(pline.bRads[i])
    }

    if (this.isDebug) console.log("mirrow ", pline, pts2)
    let rez = { type: "seg", pts: pts2 }
    rez.ends = rez.pts.map(e => e)
    if (pline.bRads) rez.bRads = bRads2
    return rez
  }

  scale(ob, k) {
    if (ob.type === "seg") ob.pts.forEach(e => this.scale(e, k))
    if (ob.type === "point") {
      ob.x *= k
      ob.y *= k
    }
  }

  clone(ob) {
    let rez

    if (ob.type === "point") {
      rez = { type: "point", x: ob.x, y: ob.y }

      if (ob.options) this.copyOptions(rez, ob)
      rez = JSON.parse(JSON.stringify(ob))
      return rez
    }

    if (ob.type === "seg") {
      rez = { type: "seg" }
      rez.pts = ob.pts.map(e => this.clone(e))
    }
    return rez
  }
} // Geom Core

let gc = new GeomCore(600, 600)