/**
 * Created by Dima on 04.01.2018.
 */



var GeomCore = function() {
    var eps = 0.00000001;
    var wcs = {orig: [0, 0], ort: [1, 1], scale: 1};

    return {
        'eps': 0.000000001,

        'point_model2view': function (p0) {
            return [wcs.orig[0]+p0[0]*wcs.ort[0], wcs.orig[1] + p0[1] * wcs.ort[1]];
        },
        'point_view2model': function (p0) {
            return [wcs.ort[0] * (p0[0] - wcs.orig[0]), wcs.ort[1] * (p0[1] - wcs.orig[1])];
        },

        'myinc2': function (d) {
            // interval, array, index, func, funcdata
            console.log('myinc2');
            d[1][d[2]] += d[4];
            return d[1][d[2]];
        },
        'mydec2': function (d) {
            d[1][d[2]] -= d[4];
            return d[1][d[2]];
        },
        'myincResume': function (d) {
            console.log('my inc resume', d);
        },

        'get_pline_para_point': function (rez, pline, paraLength) {
            // if paralength more then all length then start from the beginning
            var remained = paraLength;
            var lengths = [];
            var totalLength = 0;
            for (i=1; i<pline.length; i++) {
                lengths[i-1] = this.distance_point_point(pline[i-1], pline[i]);
                totalLength += lengths[i-1];
            };
            remained = remained % totalLength;
            var i=0;
            while(remained > lengths[i]) {
                remained -= lengths[i];
                i++;
            };
            this.get_lineseg_para_point(rez, pline[i], pline[i+1], remained);
            return rez;
        },

        'get_lineseg_para_point': function (rez, p0, p1, t) {
            var len = this.distance_point_point(p0, p1);
            var dx = p1[0] - p0[0];
            var dy = p1[1] - p0[1];
            var ratio = t / len;
            rez[0] = p0[0] + dx * ratio;
            rez[1] = p0[1] + dy * ratio;
            return rez;
        },
    

        // rez, start point, center of arc, end point, Rotation (0 - clockwise), n - number of segments
        // c0 - I, J as increments from p0
        'get_points_from_arc': function (rez, p0, p1, c0, n, sign) {
            function myXOR(a,b) {
                return ( a || b ) && !( a && b );
            }
            var ca = [p0[0] + c0[0], p0[1] + c0[1]];
            var d0 = [p0[0] - ca[0], p0[1] - ca[1]];
            var d1 = [p1[0] - ca[0], p1[1] - ca[1]];
            var r0 = Math.sqrt( d0[0]*d0[0] + d0[1]*d0[1]);
            var r1 = Math.sqrt( d1[0]*d1[0] + d1[1]*d1[1]);
            //var d0n = [sign * d0[0]/r0, sign * d0[1]/r0];
            var d0n = [d0[0]/r0, d0[1]/r0];
            //var d1n = [sign * d1[0]/r1, sign * d1[1]/r1];
            var d1n = [d1[0]/r1, d1[1]/r1];
            var a0 = Math.atan2(d0n[1],d0n[0]);
            var a1 = Math.atan2(d1n[1],d1n[0]);
            if (a0 < 0) a0+= Math.PI * 2;
            if (a1 < 0) a1+= Math.PI * 2;
            if (sign == 1 && a0 < a1) a0+= Math.PI * 2;
            if (sign == -1 && a0 > a1) a1+= Math.PI * 2;

            //if (myXOR((sign == -1), (a0 > a1))) a0+= Math.PI * 2;

            console.log('alfa', a0, a1);
            var da = (a1 - a0) / n;
            //rez.length = 0;
            var i;
            for (i=0; i<n; i++) {
                var ai = a0 + da * (i+1);
                rez.push([ca[0] + Math.cos(ai) * r0, ca[1] + Math.sin(ai) * r0]);
            };
            // push center of the arc
            //rez.push(ca);
            return rez;
        },


        //                                                                  POINT
        'point_int_line_line': function (rez, line0, line1) {
            var a0 = line0[0]; var b0=line0[1]; var c0=line0[2];
            var a1 = line1[0]; var b1=line1[1]; var c1=line1[2];
            var d = a0*b1 - b0*a1;
            
            if (Math.abs(d) < this.eps) return 'error: lines are parallel';
            //rez[0] = (b1*(0-c0) - b0*(0-c1))/d;
            rez[0] = 0 - (b1*(c0) - b0*(c1))/d;
            //rez[1] = (a0*(0-c1) - a1*(0-c0))/d;
            rez[1] = 0 - (a0*(c1) - a1*(c0))/d;
            return rez;
        },
        'point_mid_point_point': function(rez, p0, p1) {
            rez[0] = (p0[0]+p1[0])/2;
            rez[1] = (p0[1]+p1[1])/2;
            return rez;
        },
        'point_per_point_line': function(rez, point, line) {
            var line1 = []; this.line_per_point_line(line1, point, line);
            return this.point_int_line_line(rez, line, line1);
        },

        // here calculated point on the line at the specified distance from point
        'point_len_point_line': function (rez, len, point, line) {
            var p0 = []; p0 = this.point_per_point_line(p0, point, line);
            var l0 = []; l0 = this.line_per_point_line(l0, point, line);
            l0[2]+=len;
            //var rez = [];
            rez = this.point_int_line_line(rez, line, l0);
            return rez;
        },

        'point_line_para': function(rez, line, t) {
            let pp = [
                line[1] * line[2],
                line[0] * line[2]
            ]
        },





        //                                                              POINTS
        'points_int_line_circle_old': function (line, circle) {
            // assume a & b normalized
            var d = this.distance_point_line(circle[0], line);
            var ab = line[0]*line[0] + line[1]*line[1];
            var c = line[2] - d / ab;
            var a = line[0];
            var b = line[1];
            var sq = Math.abs(circle[1]*circle[1] * ab - c*c);
            var x0, y0, x1, y1;
            if (sq < eps) { // 1 point
                x0 = 0 - line[0]*c / ab;
                y0 = 0 - line[1]*c / ab;
                return [[x0 + circle[0][0], y + circle[0][1]]];
            };
            if (sq > 0) {
                x0 = (0 - line[0]*c + b*Math.sqrt(sq)) / ab;
                y0 = (0 - line[1]*c - a*Math.sqrt(sq)) / ab;
                x1 = (0 - line[0]*c - b*Math.sqrt(sq)) / ab;
                y1 = (0 - line[1]*c + a*Math.sqrt(sq)) / ab;
                return [
                    [x0 + circle[0][0], y0 + circle[0][1]],
                    [x1 + circle[0][0], y1 + circle[0][1]]
                ];
            } else {
                return []
            }
        },

        'points_int_line_circle': function (line, circle) {
            var d = this.distance_point_line(circle[0], line);
            var a = line[0]; var b = line[1];
            var st = Math.sqrt(circle[1]*circle[1] - d*d);
            var lper = [];
            this.line_per_point_line(lper, circle[0], line);
            var ptc = [];
            this.point_int_line_line(ptc, line, lper);
            var pa = lper[0]; var pb = lper[1];
            var p0 = [];
            p0[0] = ptc[0] + pa*st;
            p0[1] = ptc[1] + pb*st;
            var p1 = [];
            p1[0] = ptc[0] - pa*st;
            p1[1] = ptc[1] - pb*st;
            return [p0, p1];
        },

        //var mid = []; this.point_mid_point_point(mid, c0[0], c1[0]); // not used

        'points_int_circle_circle': function (c0, c1) {
            var d = this.distance_point_point(c0[0], c1[0]);
            var x = (c0[1]*c0[1] - c1[1]*c1[1] + d*d) / (2*d);
            var h = Math.sqrt(c0[1]*c0[1] - x*x);
            var lc = []; this.line_point_point(lc, c0[0], c1[0]);
            var lp = []; this.line_point_ab(lp, c0[0], [lc[1], -lc[0]]); lp[2]-=x;
            var p0 = []; this.point_int_line_line(p0, lp, [lc[0], lc[1], lc[2]+h]);
            var p1 = []; this.point_int_line_line(p1, lp, [lc[0], lc[1], lc[2]-h]);
            return [p0, p1];
        },


        'points_int_line_line': function (l0, l1) {
            rez = [[]]; return this.point_int_line_line(rez[0], l0, l1);
        },


        //                                                                      LINE
        'line_per_point_line': function(rez, point, line) {
            var a = line[0]; var b = line[1]; var c = line[2];
            //rez[0] = b; rez[1] = a;
            rez[0] = b; rez[1] = -a;
            rez[2] = 0 - (point[0]*rez[0] + point[1]*rez[1]);
            return rez;
        },
        'line_parallel_point_line': function(rez, point, line) {
            rez[0] = line[0]; rez[1] = line[1];
            // c = 0 - (a*x + b*y)
            rez[2] = 0 - (line[0] * point[0] + line[1]*point[1]);
            return rez;
        },
        'line_parallel_lsd': function(rez, line, side, distance) { // also can be lpd lPointd
            rez[0] = line[0]; rez[1] = line[1];
            rez[2] = line[2] + side * distance;
            return rez;
        },
        'line_point_point': function(rez, p0, p1) {
            var a = p0[1] - p1[1];
            var b = p1[0] - p0[0];
            var d = Math.sqrt(a*a + b*b);
            var c = (p0[0]*p1[1] - p1[0]*p0[1]) / d;
            a = a/d; b = b/d;
            rez[0] = a; rez[1] = b; rez[2] = c;
            return rez;
        },
        'line_lineseg': function (rez, ls) {
            return this.line_point_point(rez, ls[0], ls[1]);
        },


        //                                                  CIRCLE


        'circle_TTRS': function (rez, line0, side0, line1, side1) {
            var r = rez[1];
            var tline0 = [line0[0], line0[1], line0[2] + side0*r];
            var tline1 = [line1[0], line1[1], line1[2] + side1*r];
            var center = []; this.point_int_line_line(center, tline0, tline1);
            rez[0][0] = center[0];
            rez[0][1] = center[1];
            return rez;
        },

        //'circles_parallel_line_parallel_line_radius_distance': function (rez, els) {
        'circles_tan2_line_line_radius': function (line0, line1, r) {
            var rez = [];
            line0[2] += r; line1[2] += r;
            var point00 = []; this.point_int_line_line(point00, line0, line1);
            line1[2] -= 2*r;
            var point01 = []; this.point_int_line_line(point01, line0, line1);
            line0[2] -= 2*r; line1[2] += 2*r;
            var point10 = []; this.point_int_line_line(point10, line0, line1);
            line1[2] -= 2*r;
            line0[2] += r; line1[2] += r;  // because line0 & line1 are references !!!
            var point11 = []; this.point_int_line_line(point11, line0, line1);
            rez.push([point00, r]);
            rez.push([point01, r]);
            rez.push([point10, r]);
            rez.push([point11, r]);
            return rez;
        },

        'circle_tan2_line_line_radius_n': function (rez, l0, l1, r, n) {
            var trez = this.circles_tan_line_line_radius(l0, l1, r)
            rez[0][0] = trez[n][0][0];
            rez[0][1] = trez[n][0][1];
            rez[1] = trez[n][1];
            return rez;
        },




        //                                                  MISC
        
        'get_points': function (type, ob) {
            switch (type) {
                case 'lineseg': return ob; break;
                case 'line': return []; break;
                case 'circle': return [ob[0]]; break;
                default: return []; break;
            }
        },
        'get_lens': function (type, ob) {
            switch (type) {
                case 'lineseg': return []; break;
                case 'line': return []; break;
                case 'circle': return ob[1]; break;
                default: return []; break;
            }
        },
        'apply_matrix3': function (point_rez, matrix, point) {
            // points can be same thats why using temp vars
            // https://www.youtube.com/watch?v=DWNWLF5Hxcs
            var x, y;
            x = point[0]*matrix[0][0] + point[1]*matrix[1][0] + 1 * matrix[2][0];
            y = point[0]*matrix[0][1] + point[1]*matrix[1][1] + 1 * matrix[2][1];
            point_rez[0] = x;
            point_rez[1] = y;
            return point_rez;
        },

        'distance_point_line': function (point, line) {
            var d = Math.sqrt(line[0]*line[0] + line[1]*line[1]);
            var an = line[0] / d;
            var bn = line[1] / d;
            var cn = line[2] / d;
            return an * point[0] + bn*point[1] + cn;
        },

        'distance_point_point': function (p0, p1) {
            return Math.sqrt((p0[0]-p1[0])*(p0[0]-p1[0]) + (p0[1]-p1[1])*(p0[1]-p1[1]));
        },


        'rotate_point': function (point_rez, base, point, angleOrDir) { // maybe to store angles as [cos, sin]
            var co, si;
            if (Array.isArray(angleOrDir)) {
                co = angleOrDir[0];
                si = angleOrDir[1];
            } else {
                co = Math.cos(angleOrDir);
                si = Math.sin(angleOrDir);
            };
            var d0 = point[0] - base[0];
            var d1 = point[1] = base[1];
            point[0] = base[0] + d0*co - d1*si;
            point[1] = base[1] + d0*si + d1*co;
        },
        'rotate_common': function (base, ob, angleOrDir) {
            var co, si;
            if (Array.isArray(angleOrDir)) {
                co = angleOrDir[0];
                si = angleOrDir[1];
            } else {
                co = Math.cos(angleOrDir);
                si = Math.sin(angleOrDir);
            };
            for (i=0; i<ob.pnts.length; i++) {
                this.rotate_point(ob.pnts[i], base, ob.pnts[i], [co, si])
            };
        },
        'scale_point': function (point_rez, base, point, koef) {
            var dx = point[0] - base[0]; var dy = point[1] - base[1];
            point_rez[0] = base[0] + koef* dx;
            point_rez[1] = base[1] + koef * dy;
            return point_rez;
        },
        'scale_circle': function (ob_rez, base, ob, koef) {  // specific object OR ob.ob ???
            this.scale_point(ob_rez[0], base, ob[0], koef);
            ob_rez[1] = ob[1] * koef;
            return ob_rez;
        },
        'scale_common': function(ob_rez, base, ob, koef) {
            for (i=0; i<ob.pnts.length; i++) {
                this.scale_point(ob_rez.pnts[i], base, ob.pnts[i], koef);
            }
            return ob_rez;
        },
        'scale_lineseg': function (base, ob, koef) {

        },


        //                                                     DISTANCE
        'scalar_len_point_line': function (point, line) {
            var d = Math.sqrt(line[0]*line[0] + line[1]*line[1]);
            var an = line[0] / d;
            var bn = line[1] / d;
            var cn = line[2] / d;
            return an * point[0] + bn*point[1] + cn;
        },
        'scalar_len_point_point': function (point0, point1) {
            var dx = point1[0] - point0[0];
            var dy = point1[1] - point0[0];
            return Math.sqrt(dx*dx + dy*dy);
        },


        //                                                  EXPERIMENT
        'line_point_ab': function (line, point, ab) {
            // ax + by + c = 0;  c = -a*x - b*y;
            line[0] = ab[0]; line[1] = ab[1]; line[2] = -ab[0]*point[0] - ab[1]*point[1];
            return line;
        },

        'lineseg_set_ab': function (lineseg, ab) { // maybe should consider to pass fixed points of line segment
            // in this version just rotate about first point
            // algo:
            // 0. get line of lineseg
            // 1. create new line ab through first point
            // 2. measure length of lineseg
            // 3. place new point at same length
            var line = []; this.line_lineseg(line, lineseg);
            var line1 = []; this.line_point_ab(line1, lineseg[0], ab);
            var l = this.distance_point_point(lineseg[0], lineseg[1]);
            lineseg[1][0] = -b*l; lineseg[1][1] = a*l;
            return lineseg;
        },

        // set params, using other params.
        // ID: original object, pameters set (generated and then changed), fixed set
        // params:
        // x0, y0, x1, y1, ab, len
        'lineseg_getpars': function (lineseg) {
            var dx = lineseg[1][0] - lineseg[0][0];
            var dy = lineseg[1][1] - lineseg[0][1];
            var l = Math.sqrt(dx*dx + dy*dy);
            var ab = [dy/l, dx/l];
            return [
                lineseg[0][0],
                lineseg[0][1],
                lineseg[1][0],
                lineseg[0][1],
                ab,
                l
            ]
        },

        'lineseg_setpars': function (ls, fixes, change) {
            var s = '';
            var pars = this.lineseg_getpars(ls);
            var par_x0 = pars[0]; var par_y0 = pars[1]; var par_x1 = par[2]; var par_y1 = par[3];
            var par_ab = pars[4]; var par_l = pars[5];

            for (i=0; i<fixes.length; i++) {
                var t = '0';
                if (fixes[i] == 1) { t='1' };
                if (change.number == i) { t='2'};
                s+=t;
            };
            if (s == '110012') { // change second point by length
                ls[1][0] = ls[0][0] + par_ab[1]*par_l;
                ls[1][1] = ls[0][1] - par_ab[0]*par_l;
            };
            // etc

        },// lineseg setpars

        'point_line_circle_selector': function(rez, line, circle, selector) {

        },

        //                                                              UNIVERSAL POINTS

        selectors2: {
                tan: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
                    int: [0, 0]
            },
        selectors3: {
                tan: [
                    [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
                    [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]
                ],
                    int: [[-1, 0, 0], [1, 0, 0]]
            },


        'point_int_line_line_radius_selector': function (rez, l0, l1, r, selector) {
                //return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r], [l1[0], l1[1], l1[2] + r]);
                return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r * selector[0]], [l1[0], l1[1], l1[2] + r * selector[1]]);
            },
        'point_int_lineseg_line_radius_selector': function (rez, ls0, l1, r, selector) {
            var l0 = [];
            this.line_lineseg(l0, ls0);
            //return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r ], [l1[0], l1[1], l1[2] + r]);
            return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r * selector[0]], [l1[0], l1[1], l1[2] + r * selector[1]]);
        },
        'point_int_line_lineseg_radius_selector': function (rez, l0, ls1, r, selector) {
            var l1 = [];
            this.line_lineseg(l1, ls1);
            return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r * selector[0]], [l1[0], l1[1], l1[2] + r * selector[1]]);
            //return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r ], [l1[0], l1[1], l1[2] + r ]);
        },
        'point_int_lineseg_lineseg_radius_selector': function (rez, ls0, ls1, r, selector) {
            var l0 = [];
            this.line_lineseg(l0, ls0);
            var l1 = [];
            this.line_lineseg(l1, ls1);
            return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r * selector[0]], [l1[0], l1[1], l1[2] + r * selector[1]]);
            //return this.point_int_line_line(rez, [l0[0], l0[1], l0[2] + r ], [l1[0], l1[1], l1[2] + r ]);
        },


        'point_int_line_circle_radius_selector': function (rez, line, circle, radius, selector) {
            // selector : [intersection number, circle side, line side]
            var sline = [line[0], line[1], line[2] + selector[2] * radius];
            var scircle = [circle[0], circle[1] + selector[1] * radius];
            var h = this.distance_point_line(scircle[0], sline);
            var x2 = scircle[1] * scircle[1] - h * h;
            /*
                 if (x2 < 0) { // actually there are still 2 external circles possible
                 rez = [];
                 return rez;
                 };
                 */
            var x = Math.sqrt(x2);
            var lper = [];
            this.line_per_point_line(lper, scircle[0], sline);
            this.point_int_line_line(rez, sline, [lper[0], lper[1], lper[2] + selector[0] * x]);
            return rez;
        },
        'point_int_lineseg_circle_radius_selector': function (rez, lineseg, circle, radius, selector) {
            var line = [];
            this.line_lineseg(line, lineseg);
            return this.point_int_line_circle_radius_selector(rez, line, circle, radius, selector);
        },
        'point_int_circle_line_radius_selector': function (rez, circle, line, radius, selector) {
            return this.point_int_line_circle_radius_selector(rez, line, circle, radius, selector);
        },
        'point_int_circle_lineseg_radius_selector': function (rez, circle, lineseg, radius, selector) {
            var line = [];
            this.line_lineseg(line, lineseg);
            return this.point_int_line_circle_radius_selector(rez, line, circle, radius, selector);
        },


        'point_int_circle_circle_radius_selector': function (rez, c0, c1, radius, selector) {
            // selector: [intNumber, c0 side, c1 side]
            var d = this.distance_point_point(c0[0], c1[0]);
            var lc = [];
            this.line_point_point(lc, c0[0], c1[0]);
            var lp = [];
            this.line_per_point_line(lp, c0[0], lc);
            var r0 = c0[1] + selector[1] * radius;
            var r1 = c1[1] + selector[2] * radius;
            var x = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
            var h = Math.sqrt(r0 * r0 - x * x);
            this.point_int_line_line(rez, [lc[0], lc[1], lc[2] + selector[0] * h], [lp[0], lp[1], lp[2] - x]);
        },


            'ff2': function () {

              return {
                  '_line_line': {
                      func: this.point_int_line_line_radius_selector,
                      selectors: {
                          tan: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
                          int: [0, 0]
                      }
                  },
                  '_line_lineseg': {
                      func: this.point_int_line_lineseg_radius_selector,
                      selectors: this.selectors2
                  },
                  '_lineseg_line': {
                      func: this.point_int_lineseg_line_radius_selector,
                      selectors: this.selectors2
                  },
                  '_lineseg_lineseg': {
                      func: this.point_int_lineseg_lineseg_radius_selector,
                      selectors: this.selectors2
                  },

                  '_line_circle': {
                      func: this.point_int_line_circle_radius_selector,
                      selectors: this.selectors3
                  },
                  '_lineseg_circle': {
                      func: this.point_int_lineseg_circle_radius_selector,
                      selectors: this.selectors3
                  },
                  '_circle_lineseg': {
                      func: this.point_int_circle_lineseg_radius_selector,
                      selectors: this.selectors3
                  },
                  '_circle_line': {
                      func: this.point_int_circle_line_radius_selector,
                      selectors: this.selectors3
                  },
                  '_circle_circle': {
                      func: this.point_int_circle_circle_radius_selector,
                      selectors: this.selectors3
                  }
              }
        },

                points_univers: function (el0, el1, radius, types, reg) { //reg = 'tan' or 'int'
                    var ff = {
                        '_line_line': this._line_line,
                        '_line_lineseg': this._line_lineseg,
                        '_lineseg_line': this._lineseg_line,
                        '_lineseg_lineseg': {
                            func: this.point_int_lineseg_lineseg_radius_selector,
                            selectors: this.selectors2
                        },
                        '_line_circle': this._line_circle,
                        '_lineseg_circle': this._lineseg_circle,
                        '_circle_line': this._circle_line,
                        '_circle_lineseg': this._circle_lineseg,
                        '_circle_circle': this._circle_circle
                    };
                    var ff2 = this.ff2();

                    var trez = [];
                    var f = ff2[types];
                    for (i = 0; i < f.selectors[reg].length; i++) {
                    //for (i = 0; i < this.funcs[types].selectors[reg].length; i++) {
                        trez[i] = [];
                        //var ff = 'point_int' + types + '_radius_selector';

                        f.func.apply(this, [trez[i], el0, el1, radius, f.selectors[reg][i]]);
                        //f.func.apply(this, [trez[i], el0, el1, radius, this.selectors3.tan[i]]);

                        //this.funcs[types].func(trez[i], el0, el1, radius, f.selectors[reg][i]);
                    }
                    return trez;
                }, // points int el el

                point_univers: function (rez, el0, el1, radius, types, selector_number, reg) {
                    var ff = {
                        '_line_line': this._line_line,
                        '_line_lineseg': this._line_lineseg,
                        '_lineseg_line': this._lineseg_line,
                        '_lineseg_lineseg': this._lineseg_lineseg,
                        '_line_circle': this._line_circle,
                        '_lineseg_circle': this._lineseg_circle,
                        '_circle_line': this._circle_line,
                        '_circle_lineseg': this._circle_lineseg,
                        '_circle_circle': this._circle_circle

                    };
                    var ff2 = this.ff2();

                    var f = ff2[types];
                    var selector = f.selectors[reg][selector_number];



                    return f.func.apply(this, [rez, el0, el1, radius, selector]);
                    //return this.funcs[types].func(rez, el0, el1, radius, selector);
                },
                circle_univers: function (rez, el0, el1, types, selector_number) {
                    return this.point_univers(rez[0], el0, el1, rez[1], types, selector_number, 'tan');
                }






/*
        'points_int': [],
        'int': {
            points: function(el0, el1, types) {

            }

            'lineline': {


            },
            'linecircle': {
                selectorArray: [-1, 1],
                point: function(p, line, circle, selector) {
                    p[0] = ljsdf + selector *h;
                    return p;
                }
                points: function(line, circle) {
                    var rez = []
                    for (i =0; i<this.selectorArray.length; i++) {
                        rez[i] = [];
                        this.point(rez[i], selectorArra[i]);
                    }
                }
            },
            point: function(ob0, ob1, selector){

            },
            intArray: {
                'lineline': [0],
                'linecircle': [0, 1]
            }
        }

*/




//                                                              END of GEOM CORE




}
}


//module.exports = GeomCore;

