/**
 * Created by kaimingyi on 2016/11/9.
 */

var math = math || {};
module.exports = math;

math.vec3 = function(){};

math.vec3.prototype.create = function(){
    return new Float32Array(3);
};

math.vec3.prototype.normalize = function(v){
    var n = this.create();
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if(l > 0){
        var e = 1.0 / l;
        n[0] = v[0] * e;
        n[1] = v[1] * e;
        n[2] = v[2] * e;
    }
    return n;
};

math.vec3.prototype.length = function(v){
    var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return l;
};

math.vec3.prototype.dot = function(v0, v1){
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
};

math.vec3.prototype.cross = function(v0, v1){
    var n = this.create();
    n[0] = v0[1] * v1[2] - v0[2] * v1[1];
    n[1] = v0[2] * v1[0] - v0[0] * v1[2];
    n[2] = v0[0] * v1[1] - v0[1] * v1[0];
    return n;
};

math.vec3.prototype.faceNormal = function(v0, v1, v2){
    var n = this.create();
    var vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
    var vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
    n[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
    n[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
    n[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
    return this.normalize(n);
};

math.vec3 = new math.vec3();


math.mat4 = function(){};

math.mat4.prototype.create = function(){
    return new Float32Array(16);
};

math.mat4.prototype.identity = function(dest){
    dest[0]  = 1; dest[1]  = 0; dest[2]  = 0; dest[3]  = 0;
    dest[4]  = 0; dest[5]  = 1; dest[6]  = 0; dest[7]  = 0;
    dest[8]  = 0; dest[9]  = 0; dest[10] = 1; dest[11] = 0;
    dest[12] = 0; dest[13] = 0; dest[14] = 0; dest[15] = 1;
    return dest;
};

math.mat4.prototype.multiply = function(mat1, mat2, dest){
    var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
        e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
        i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
        m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
        A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
        E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
        I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
        M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
    dest[0]  = A * a + B * e + C * i + D * m;
    dest[1]  = A * b + B * f + C * j + D * n;
    dest[2]  = A * c + B * g + C * k + D * o;
    dest[3]  = A * d + B * h + C * l + D * p;
    dest[4]  = E * a + F * e + G * i + H * m;
    dest[5]  = E * b + F * f + G * j + H * n;
    dest[6]  = E * c + F * g + G * k + H * o;
    dest[7]  = E * d + F * h + G * l + H * p;
    dest[8]  = I * a + J * e + K * i + L * m;
    dest[9]  = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
};

math.mat4.prototype.scale = function(mat, vec, dest){
    dest[0]  = mat[0]  * vec[0];
    dest[1]  = mat[1]  * vec[0];
    dest[2]  = mat[2]  * vec[0];
    dest[3]  = mat[3]  * vec[0];
    dest[4]  = mat[4]  * vec[1];
    dest[5]  = mat[5]  * vec[1];
    dest[6]  = mat[6]  * vec[1];
    dest[7]  = mat[7]  * vec[1];
    dest[8]  = mat[8]  * vec[2];
    dest[9]  = mat[9]  * vec[2];
    dest[10] = mat[10] * vec[2];
    dest[11] = mat[11] * vec[2];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
};

math.mat4.prototype.translate = function(mat, vec, dest){
    dest[0] = mat[0]; dest[1] = mat[1]; dest[2]  = mat[2];  dest[3]  = mat[3];
    dest[4] = mat[4]; dest[5] = mat[5]; dest[6]  = mat[6];  dest[7]  = mat[7];
    dest[8] = mat[8]; dest[9] = mat[9]; dest[10] = mat[10]; dest[11] = mat[11];
    dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8]  * vec[2] + mat[12];
    dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9]  * vec[2] + mat[13];
    dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return dest;
};

math.mat4.prototype.rotate = function(mat, angle, axis, dest){
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if(!sq){return null;}
    var a = axis[0], b = axis[1], c = axis[2];
    if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
    var d = Math.sin(angle), e = Math.cos(angle), f = 1 - e,
        g = mat[0],  h = mat[1], i = mat[2],  j = mat[3],
        k = mat[4],  l = mat[5], m = mat[6],  n = mat[7],
        o = mat[8],  p = mat[9], q = mat[10], r = mat[11],
        s = a * a * f + e,
        t = b * a * f + c * d,
        u = c * a * f - b * d,
        v = a * b * f - c * d,
        w = b * b * f + e,
        x = c * b * f + a * d,
        y = a * c * f + b * d,
        z = b * c * f - a * d,
        A = c * c * f + e;
    if(angle){
        if(mat != dest){
            dest[12] = mat[12]; dest[13] = mat[13];
            dest[14] = mat[14]; dest[15] = mat[15];
        }
    } else {
        dest = mat;
    }
    dest[0]  = g * s + k * t + o * u;
    dest[1]  = h * s + l * t + p * u;
    dest[2]  = i * s + m * t + q * u;
    dest[3]  = j * s + n * t + r * u;
    dest[4]  = g * v + k * w + o * x;
    dest[5]  = h * v + l * w + p * x;
    dest[6]  = i * v + m * w + q * x;
    dest[7]  = j * v + n * w + r * x;
    dest[8]  = g * y + k * z + o * A;
    dest[9]  = h * y + l * z + p * A;
    dest[10] = i * y + m * z + q * A;
    dest[11] = j * y + n * z + r * A;
    return dest;
};

math.mat4.prototype.lookAt = function(eye, center, up, dest){
    var eyeX    = eye[0],    eyeY    = eye[1],    eyeZ    = eye[2],
        upX     = up[0],     upY     = up[1],     upZ     = up[2],
        centerX = center[0], centerY = center[1], centerZ = center[2];
    if(eyeX == centerX && eyeY == centerY && eyeZ == centerZ){return this.identity(dest);}
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0]; z1 = eyeY - center[1]; z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l; z1 *= l; z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if(!l){
        x0 = 0; x1 = 0; x2 = 0;
    } else {
        l = 1 / l;
        x0 *= l; x1 *= l; x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if(!l){
        y0 = 0; y1 = 0; y2 = 0;
    } else {
        l = 1 / l;
        y0 *= l; y1 *= l; y2 *= l;
    }
    dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
    dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
    dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
};

math.mat4.prototype.perspective = function(fovy, aspect, near, far, dest){
    var t = near * Math.tan(fovy * Math.PI / 360);
    var r = t * aspect;
    var a = r * 2, b = t * 2, c = far - near;
    dest[0]  = near * 2 / a;
    dest[1]  = 0;
    dest[2]  = 0;
    dest[3]  = 0;
    dest[4]  = 0;
    dest[5]  = near * 2 / b;
    dest[6]  = 0;
    dest[7]  = 0;
    dest[8]  = 0;
    dest[9]  = 0;
    dest[10] = -(far + near) / c;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / c;
    dest[15] = 0;
    return dest;
};

math.mat4.prototype.ortho = function(left, right, top, bottom, near, far, dest) {
    var h = (right - left);
    var v = (top - bottom);
    var d = (far - near);
    dest[0]  = 2 / h;
    dest[1]  = 0;
    dest[2]  = 0;
    dest[3]  = 0;
    dest[4]  = 0;
    dest[5]  = 2 / v;
    dest[6]  = 0;
    dest[7]  = 0;
    dest[8]  = 0;
    dest[9]  = 0;
    dest[10] = -2 / d;
    dest[11] = 0;
    dest[12] = -(left + right) / h;
    dest[13] = -(top + bottom) / v;
    dest[14] = -(far + near) / d;
    dest[15] = 1;
    return dest;
};

math.mat4.prototype.transpose = function(mat, dest){
    dest[0]  = mat[0];  dest[1]  = mat[4];
    dest[2]  = mat[8];  dest[3]  = mat[12];
    dest[4]  = mat[1];  dest[5]  = mat[5];
    dest[6]  = mat[9];  dest[7]  = mat[13];
    dest[8]  = mat[2];  dest[9]  = mat[6];
    dest[10] = mat[10]; dest[11] = mat[14];
    dest[12] = mat[3];  dest[13] = mat[7];
    dest[14] = mat[11]; dest[15] = mat[15];
    return dest;
};

math.mat4.prototype.inverse = function(mat, dest){
    var a = mat[0],  b = mat[1],  c = mat[2],  d = mat[3],
        e = mat[4],  f = mat[5],  g = mat[6],  h = mat[7],
        i = mat[8],  j = mat[9],  k = mat[10], l = mat[11],
        m = mat[12], n = mat[13], o = mat[14], p = mat[15],
        q = a * f - b * e, r = a * g - c * e,
        s = a * h - d * e, t = b * g - c * f,
        u = b * h - d * f, v = c * h - d * g,
        w = i * n - j * m, x = i * o - k * m,
        y = i * p - l * m, z = j * o - k * n,
        A = j * p - l * n, B = k * p - l * o,
        ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
    dest[0]  = ( f * B - g * A + h * z) * ivd;
    dest[1]  = (-b * B + c * A - d * z) * ivd;
    dest[2]  = ( n * v - o * u + p * t) * ivd;
    dest[3]  = (-j * v + k * u - l * t) * ivd;
    dest[4]  = (-e * B + g * y - h * x) * ivd;
    dest[5]  = ( a * B - c * y + d * x) * ivd;
    dest[6]  = (-m * v + o * s - p * r) * ivd;
    dest[7]  = ( i * v - k * s + l * r) * ivd;
    dest[8]  = ( e * A - f * y + h * w) * ivd;
    dest[9]  = (-a * A + b * y - d * w) * ivd;
    dest[10] = ( m * u - n * s + p * q) * ivd;
    dest[11] = (-i * u + j * s - l * q) * ivd;
    dest[12] = (-e * z + f * x - g * w) * ivd;
    dest[13] = ( a * z - b * x + c * w) * ivd;
    dest[14] = (-m * t + n * r - o * q) * ivd;
    dest[15] = ( i * t - j * r + k * q) * ivd;
    return dest;
};

math.mat4.prototype.vpFromCamera = function(cam, vmat, pmat, dest){
    this.lookAt(cam.position, cam.centerPoint, cam.upDirection, vmat);
    this.perspective(cam.fovy, cam.aspect, cam.near, cam.far, pmat);
    this.multiply(pmat, vmat, dest);
};

math.mat4 = new math.mat4();


math.quat4 = function(){};

math.quat4.prototype.create = function(){
    return new Float32Array(4);
};

math.quat4.prototype.identity = function(dest){
    dest[0] = 0; dest[1] = 0; dest[2] = 0; dest[3] = 1;
    return dest;
};

math.quat4.prototype.inverse = function(qtn, dest){
    dest[0] = -qtn[0];
    dest[1] = -qtn[1];
    dest[2] = -qtn[2];
    dest[3] =  qtn[3];
    return dest;
};

math.quat4.prototype.normalize = function(dest){
    var x = dest[0], y = dest[1], z = dest[2], w = dest[3];
    var l = Math.sqrt(x * x + y * y + z * z + w * w);
    if(l === 0){
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
    }else{
        l = 1 / l;
        dest[0] = x * l;
        dest[1] = y * l;
        dest[2] = z * l;
        dest[3] = w * l;
    }
    return dest;
};

math.quat4.prototype.multiply = function(qtn1, qtn2, dest){
    var ax = qtn1[0], ay = qtn1[1], az = qtn1[2], aw = qtn1[3];
    var bx = qtn2[0], by = qtn2[1], bz = qtn2[2], bw = qtn2[3];
    dest[0] = ax * bw + aw * bx + ay * bz - az * by;
    dest[1] = ay * bw + aw * by + az * bx - ax * bz;
    dest[2] = az * bw + aw * bz + ax * by - ay * bx;
    dest[3] = aw * bw - ax * bx - ay * by - az * bz;
    return dest;
};

math.quat4.prototype.rotate = function(angle, axis, dest){
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if(!sq){return null;}
    var a = axis[0], b = axis[1], c = axis[2];
    if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
    var s = Math.sin(angle * 0.5);
    dest[0] = a * s;
    dest[1] = b * s;
    dest[2] = c * s;
    dest[3] = Math.cos(angle * 0.5);
    return dest;
};

math.quat4.prototype.toVecIII = function(vec, qtn, dest){
    var qp = this.create();
    var qq = this.create();
    var qr = this.create();
    this.inverse(qtn, qr);
    qp[0] = vec[0];
    qp[1] = vec[1];
    qp[2] = vec[2];
    this.multiply(qr, qp, qq);
    this.multiply(qq, qtn, qr);
    dest[0] = qr[0];
    dest[1] = qr[1];
    dest[2] = qr[2];
    return dest;
};

math.quat4.prototype.toMatIV = function(qtn, dest){
    var x = qtn[0], y = qtn[1], z = qtn[2], w = qtn[3];
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;
    dest[0]  = 1 - (yy + zz);
    dest[1]  = xy - wz;
    dest[2]  = xz + wy;
    dest[3]  = 0;
    dest[4]  = xy + wz;
    dest[5]  = 1 - (xx + zz);
    dest[6]  = yz - wx;
    dest[7]  = 0;
    dest[8]  = xz - wy;
    dest[9]  = yz + wx;
    dest[10] = 1 - (xx + yy);
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
};

math.quat4.prototype.slerp = function(qtn1, qtn2, time, dest){
    var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3];
    var hs = 1.0 - ht * ht;
    if(hs <= 0.0){
        dest[0] = qtn1[0];
        dest[1] = qtn1[1];
        dest[2] = qtn1[2];
        dest[3] = qtn1[3];
    }else{
        hs = Math.sqrt(hs);
        if(Math.abs(hs) < 0.0001){
            dest[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
            dest[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
            dest[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
            dest[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
        }else{
            var ph = Math.acos(ht);
            var pt = ph * time;
            var t0 = Math.sin(ph - pt) / hs;
            var t1 = Math.sin(pt) / hs;
            dest[0] = qtn1[0] * t0 + qtn2[0] * t1;
            dest[1] = qtn1[1] * t0 + qtn2[1] * t1;
            dest[2] = qtn1[2] * t0 + qtn2[2] * t1;
            dest[3] = qtn1[3] * t0 + qtn2[3] * t1;
        }
    }
    return dest;
};

math.camera = {
    create: function(position, centerPoint, upDirection, fovy, aspect, near, far){
        var c = new math.cam();
        var n = math.vec3.create();
        n[0] = upDirection[0];
        n[1] = upDirection[1];
        n[2] = upDirection[2];
        n = math.vec3.normalize(n);
        c.init(position, centerPoint, n, fovy, aspect, near, far);
        return c;
    }
};

math.cam = function(){};

math.cam.prototype.position        = math.vec3.create();
math.cam.prototype.centerPoint     = math.vec3.create();
math.cam.prototype.upDirection     = math.vec3.create();
math.cam.prototype.basePosition    = math.vec3.create();
math.cam.prototype.baseCenterPoint = math.vec3.create();
math.cam.prototype.baseUpDirection = math.vec3.create();

math.cam.prototype.fovy   = 45;
math.cam.prototype.aspect = 1.0;
math.cam.prototype.near   = 0.1;
math.cam.prototype.far    = 1.0;

math.cam.prototype.init = function(position, centerPoint, upDirection, fovy, aspect, near, far){
    this.position    = math.vec3.create();
    this.centerPoint = math.vec3.create();
    this.upDirection = math.vec3.create();
    this.basePosition    = math.vec3.create();
    this.baseCenterPoint = math.vec3.create();
    this.baseUpDirection = math.vec3.create();
    this.position[0]    = this.basePosition[0]    = position[0];
    this.position[1]    = this.basePosition[1]    = position[1];
    this.position[2]    = this.basePosition[2]    = position[2];
    this.centerPoint[0] = this.baseCenterPoint[0] = centerPoint[0];
    this.centerPoint[1] = this.baseCenterPoint[1] = centerPoint[1];
    this.centerPoint[2] = this.baseCenterPoint[2] = centerPoint[2];
    this.upDirection[0] = this.baseUpDirection[0] = upDirection[0];
    this.upDirection[1] = this.baseUpDirection[1] = upDirection[1];
    this.upDirection[2] = this.baseUpDirection[2] = upDirection[2];
    this.fovy   = fovy;
    this.aspect = aspect;
    this.near   = near;
    this.far    = far;
};







/// procedural mesh
math.mesh = {
    sphere: function(row, column, radius, color){
        var i, j, tc;
        var pos = [], idx = [];
        for(i = 0; i <= row; i++){
            var r = Math.PI / row * i;
            var ry = Math.cos(r);
            var rr = Math.sin(r);
            for(j = 0; j <= column; j++){
                var tr = Math.PI * 2 / column * j;
                var tx = rr * radius * Math.cos(tr);
                var ty = ry * radius;
                var tz = rr * radius * Math.sin(tr);
                var rx = rr * Math.cos(tr);
                var rz = rr * Math.sin(tr);

                tc = color;

                pos.push(tx, ty, tz);
                pos.push(rx, ry, rz);
                //pos.push(tc[0], tc[1], tc[2], tc[3]);
                pos.push(1 - 1 / column * j, 1 / row * i);
            }
        }
        r = 0;
        for(i = 0; i < row; i++){
            for(j = 0; j < column; j++){
                r = (column + 1) * i + j;
                idx.push(r, r + 1, r + column + 2);
                idx.push(r, r + column + 2, r + column + 1);
            }
        }
        return {position: pos, index: idx};
    },
};


