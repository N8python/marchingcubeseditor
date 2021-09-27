class MarchingCubes {
    constructor(width, height, depth) {
        this.voxelBuffer = new Float32Array(width * height * depth);
        this.colorBuffer = new Float32Array(width * height * depth * 3);
        for (let i = 0; i < this.colorBuffer.length; i++) {
            this.colorBuffer[i] = 0.75;
        }
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthdepth = this.width * this.depth;
        this.indices = new Uint32Array(this.width * this.height * this.depth * 12);
        this.vertices = new Float32Array(this.width * this.height * this.depth * 12 * 3);
        this.normals = new Float32Array(this.width * this.height * this.depth * 12 * 3);
        this.colors = new Float32Array(this.width * this.height * this.depth * 12 * 3);
    }
    set(x, y, z, amt) {
        this.voxelBuffer[x * this.width * this.depth + z * this.depth + y] = amt;
    }
    get(x, y, z) {
        return this.voxelBuffer[x * this.width * this.depth + z * this.depth + y];
    }
    setColor(x, y, z, r, g, b) {
        const colorIdx = (x * this.width * this.depth + z * this.depth + y) * 3
        this.colorBuffer[colorIdx] = r;
        this.colorBuffer[colorIdx + 1] = g;
        this.colorBuffer[colorIdx + 2] = b;
    }
    getColor(x, y, z) {
            const colorIdx = (x * this.width * this.depth + z * this.depth + y) * 3;
            return [this.colorBuffer[colorIdx], this.colorBuffer[colorIdx + 1], this.colorBuffer[colorIdx + 2]];
        }
        /*makeSphere(brushSize, color, point, multiplier) {
            const brushColor = color;
            for (let x = -brushSize - 2; x <= brushSize + 2; x++) {
                for (let y = -brushSize - 2; y <= brushSize + 2; y++) {
                    for (let z = -brushSize - 2; z <= brushSize + 2; z++) {
                        if (sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) < 0) {
                            mainScene.marchingcubes.set(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z), mainScene.marchingcubes.get(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z)) - sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) * (multiplier));
                        }
                        if (sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) < 1 && multiplier > 0) {
                            const color = mainScene.marchingcubes.getColor(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z));
                            const blendFactor = sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) <= 0 ? 1 : 0.5; //- (sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) + brushSize) / (brushSize + 1);
                            const finalColor = [brushColor[0] * blendFactor + color[0] * (1 - blendFactor), brushColor[1] * blendFactor + color[1] * (1 - blendFactor), brushColor[2] * blendFactor + color[2] * (1 - blendFactor)];
                            mainScene.marchingcubes.setColor(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z), ...finalColor);
                        }
                    }
                }
            }
        }*/
    makeShape(brushSize, color, point, multiplier, distanceFunction) {
        const brushColor = color;
        for (let x = -brushSize - 2; x <= brushSize + 2; x++) {
            for (let y = -brushSize - 2; y <= brushSize + 2; y++) {
                for (let z = -brushSize - 2; z <= brushSize + 2; z++) {
                    if (distanceFunction(point.clone(), new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) < 0) {
                        mainScene.marchingcubes.set(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z), mainScene.marchingcubes.get(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z)) - distanceFunction(point.clone(), new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) * (multiplier));
                    }
                    if (distanceFunction(point.clone(), new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) < 1 && multiplier > 0) {
                        const color = mainScene.marchingcubes.getColor(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z));
                        const blendFactor = distanceFunction(point.clone(), new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) < 0 ? 1 : 0.5; //- (sphereDistance(point, new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize) + brushSize) / (brushSize + 1);
                        const finalColor = [brushColor[0] * blendFactor + color[0] * (1 - blendFactor), brushColor[1] * blendFactor + color[1] * (1 - blendFactor), brushColor[2] * blendFactor + color[2] * (1 - blendFactor)];
                        mainScene.marchingcubes.setColor(Math.round(point.x + x), Math.round(point.y + y), Math.round(point.z + z), ...finalColor);
                    }
                }
            }
        }
    }
    setMesh(geo, surfaceLevel) {
        const indices = this.indices;
        const vertices = this.vertices;
        const normals = this.normals;
        const colors = this.colors;
        let idxCounter = 0;
        let vIdx = 0;
        let edge0 = new Float32Array(3);
        let edge1 = new Float32Array(3);
        let edge2 = new Float32Array(3);
        let edge3 = new Float32Array(3);
        let edge4 = new Float32Array(3);
        let edge5 = new Float32Array(3);
        let edge6 = new Float32Array(3);
        let edge7 = new Float32Array(3);
        let edge8 = new Float32Array(3);
        let edge9 = new Float32Array(3);
        let edge10 = new Float32Array(3);
        let edge11 = new Float32Array(3);
        let col0 = new Float32Array(3);
        let col1 = new Float32Array(3);
        let col2 = new Float32Array(3);
        let col3 = new Float32Array(3);
        let col4 = new Float32Array(3);
        let col5 = new Float32Array(3);
        let col6 = new Float32Array(3);
        let col7 = new Float32Array(3);
        let col8 = new Float32Array(3);
        let col9 = new Float32Array(3);
        let col10 = new Float32Array(3);
        let col11 = new Float32Array(3);
        let norm0 = new Float32Array(3);
        let norm1 = new Float32Array(3);
        let norm2 = new Float32Array(3);
        let norm3 = new Float32Array(3);
        let norm4 = new Float32Array(3);
        let norm5 = new Float32Array(3);
        let norm6 = new Float32Array(3);
        let norm7 = new Float32Array(3);
        let norm8 = new Float32Array(3);
        let norm9 = new Float32Array(3);
        let norm10 = new Float32Array(3);
        let norm11 = new Float32Array(3);
        let normalEdges = [norm0, norm1, norm2, norm3, norm4, norm5, norm6, norm7, norm8, norm9, norm10, norm11];
        let colorEdges = [col0, col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11]
        let edges = [edge0, edge1, edge2, edge3, edge4, edge5, edge6, edge7, edge8, edge9, edge10, edge11];
        for (let x = -this.width / 2 + 1; x < this.width / 2 - 2; x += 1) {
            for (let z = -this.depth / 2 + 1; z < this.depth / 2 - 2; z += 1) {
                for (let y = -this.height / 2 + 1; y < this.height / 2 - 2; y += 1) {
                    const offsetX = x + this.width / 2;
                    const offsetY = y + this.height / 2;
                    const offsetZ = z + this.depth / 2;
                    const colorPos = (offsetX * this.widthdepth + offsetZ * this.depth + offsetY) * 3;
                    const e0 = this.voxelBuffer[offsetX * this.widthdepth + offsetZ * this.depth + offsetY];
                    const e1 = this.voxelBuffer[(offsetX + 1) * this.widthdepth + offsetZ * this.depth + offsetY];
                    const e2 = this.voxelBuffer[(offsetX + 1) * this.widthdepth + (offsetZ + 1) * this.depth + offsetY];
                    const e3 = this.voxelBuffer[offsetX * this.widthdepth + (offsetZ + 1) * this.depth + offsetY];
                    const e4 = this.voxelBuffer[offsetX * this.widthdepth + offsetZ * this.depth + offsetY + 1];
                    const e5 = this.voxelBuffer[(offsetX + 1) * this.widthdepth + offsetZ * this.depth + offsetY + 1];
                    const e6 = this.voxelBuffer[(offsetX + 1) * this.widthdepth + (offsetZ + 1) * this.depth + offsetY + 1];
                    const e7 = this.voxelBuffer[offsetX * this.widthdepth + (offsetZ + 1) * this.depth + offsetY + 1];
                    let cubeindex = 0;
                    if (e0 < surfaceLevel) cubeindex += 1;
                    if (e1 < surfaceLevel) cubeindex += 2;
                    if (e2 < surfaceLevel) cubeindex += 4;
                    if (e3 < surfaceLevel) cubeindex += 8;
                    if (e4 < surfaceLevel) cubeindex += 16;
                    if (e5 < surfaceLevel) cubeindex += 32;
                    if (e6 < surfaceLevel) cubeindex += 64;
                    if (e7 < surfaceLevel) cubeindex += 128;
                    const edge = edgeTable[cubeindex];
                    if (edge !== 0) {
                        let xNorm = this.voxelBuffer[(offsetX + 1) * this.widthdepth + offsetZ * this.depth + offsetY] - this.voxelBuffer[(offsetX - 1) * this.widthdepth + offsetZ * this.depth + offsetY];
                        let yNorm = this.voxelBuffer[offsetX * this.widthdepth + offsetZ * this.depth + offsetY + 1] - this.voxelBuffer[offsetX * this.widthdepth + offsetZ * this.depth + offsetY - 1];
                        let zNorm = this.voxelBuffer[offsetX * this.widthdepth + (offsetZ + 1) * this.depth + offsetY] - this.voxelBuffer[offsetX * this.widthdepth + (offsetZ - 1) * this.depth + offsetY];
                        const colorX0 = this.colorBuffer[colorPos];
                        const colorY0 = this.colorBuffer[colorPos + 1];
                        const colorZ0 = this.colorBuffer[colorPos + 2];
                        const colorX1 = this.colorBuffer[colorPos + this.widthdepth * 3];
                        const colorY1 = this.colorBuffer[colorPos + this.widthdepth * 3 + 1];
                        const colorZ1 = this.colorBuffer[colorPos + this.widthdepth * 3 + 2];
                        const colorX2 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3];
                        const colorY2 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3 + 1];
                        const colorZ2 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3 + 2];
                        const colorX3 = this.colorBuffer[colorPos + this.depth * 3];
                        const colorY3 = this.colorBuffer[colorPos + this.depth * 3 + 1];
                        const colorZ3 = this.colorBuffer[colorPos + this.depth * 3 + 2];
                        const colorX4 = this.colorBuffer[colorPos + 3];
                        const colorY4 = this.colorBuffer[colorPos + 3 + 1];
                        const colorZ4 = this.colorBuffer[colorPos + 3 + 2];
                        const colorX5 = this.colorBuffer[colorPos + this.widthdepth * 3 + 3];
                        const colorY5 = this.colorBuffer[colorPos + this.widthdepth * 3 + 3 + 1];
                        const colorZ5 = this.colorBuffer[colorPos + this.widthdepth * 3 + 3 + 2];
                        const colorX6 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3 + 3];
                        const colorY6 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3 + 3 + 1];
                        const colorZ6 = this.colorBuffer[colorPos + this.widthdepth * 3 + this.depth * 3 + 3 + 2];
                        const colorX7 = this.colorBuffer[colorPos + this.depth * 3 + 3];
                        const colorY7 = this.colorBuffer[colorPos + this.depth * 3 + 3 + 1];
                        const colorZ7 = this.colorBuffer[colorPos + this.depth * 3 + 3 + 2];
                        const normalPos = offsetX * this.widthdepth + offsetZ * this.depth + offsetY;
                        const normalX0 = this.voxelBuffer[normalPos + this.widthdepth] - this.voxelBuffer[normalPos - this.widthdepth];
                        const normalY0 = this.voxelBuffer[normalPos + 1] - this.voxelBuffer[normalPos - 1];
                        const normalZ0 = this.voxelBuffer[normalPos + this.depth] - this.voxelBuffer[normalPos - this.depth];
                        const normalX1 = this.voxelBuffer[normalPos + this.widthdepth * 2] - this.voxelBuffer[normalPos];
                        const normalY1 = this.voxelBuffer[normalPos + this.widthdepth + 1] - this.voxelBuffer[normalPos + this.widthdepth - 1];
                        const normalZ1 = this.voxelBuffer[normalPos + this.widthdepth + this.depth] - this.voxelBuffer[normalPos + this.widthdepth - this.depth];
                        const normalX2 = this.voxelBuffer[normalPos + this.widthdepth * 2 + this.depth] - this.voxelBuffer[normalPos + this.depth];
                        const normalY2 = this.voxelBuffer[normalPos + this.widthdepth + this.depth + 1] - this.voxelBuffer[normalPos + this.widthdepth + this.depth - 1];
                        const normalZ2 = this.voxelBuffer[normalPos + this.widthdepth + this.depth * 2] - this.voxelBuffer[normalPos + this.widthdepth];
                        const normalX3 = this.voxelBuffer[normalPos + this.depth + this.widthdepth] - this.voxelBuffer[normalPos + this.depth - this.widthdepth];
                        const normalY3 = this.voxelBuffer[normalPos + this.depth + 1] - this.voxelBuffer[normalPos + this.depth - 1];
                        const normalZ3 = this.voxelBuffer[normalPos + this.depth * 2] - this.voxelBuffer[normalPos];
                        const normalX4 = this.voxelBuffer[normalPos + this.widthdepth + 1] - this.voxelBuffer[normalPos - this.widthdepth + 1];
                        const normalY4 = this.voxelBuffer[normalPos + 1 + 1] - this.voxelBuffer[normalPos - 1 + 1];
                        const normalZ4 = this.voxelBuffer[normalPos + this.depth + 1] - this.voxelBuffer[normalPos - this.depth + 1];
                        const normalX5 = this.voxelBuffer[normalPos + this.widthdepth * 2 + 1] - this.voxelBuffer[normalPos + 1];
                        const normalY5 = this.voxelBuffer[normalPos + this.widthdepth + 1 + 1] - this.voxelBuffer[normalPos + this.widthdepth - 1 + 1];
                        const normalZ5 = this.voxelBuffer[normalPos + this.widthdepth + this.depth + 1] - this.voxelBuffer[normalPos + this.widthdepth - this.depth + 1];
                        const normalX6 = this.voxelBuffer[normalPos + this.widthdepth * 2 + this.depth + 1] - this.voxelBuffer[normalPos + this.depth + 1];
                        const normalY6 = this.voxelBuffer[normalPos + this.widthdepth + this.depth + 1 + 1] - this.voxelBuffer[normalPos + this.widthdepth + this.depth - 1 + 1];
                        const normalZ6 = this.voxelBuffer[normalPos + this.widthdepth + this.depth * 2 + 1] - this.voxelBuffer[normalPos + this.widthdepth + 1];
                        const normalX7 = this.voxelBuffer[normalPos + this.depth + this.widthdepth + 1] - this.voxelBuffer[normalPos + this.depth - this.widthdepth + 1];
                        const normalY7 = this.voxelBuffer[normalPos + this.depth + 1 + 1] - this.voxelBuffer[normalPos + this.depth - 1 + 1];
                        const normalZ7 = this.voxelBuffer[normalPos + this.depth * 2 + 1] - this.voxelBuffer[normalPos + 1];
                        if (xNorm === 0 && yNorm === 0 && zNorm === 0) {
                            xNorm = 1;
                            yNorm = 1;
                            zNorm = 1;
                        }
                        if (edge & 1) {
                            const mu = (surfaceLevel - e0) / (e1 - e0);
                            edge0[0] = x + mu;
                            edge0[1] = y;
                            edge0[2] = z;
                            col0[0] = colorX0 * (1 - mu) + colorX1 * mu;
                            col0[1] = colorY0 * (1 - mu) + colorY1 * mu;
                            col0[2] = colorZ0 * (1 - mu) + colorZ1 * mu;
                            norm0[0] = normalX0 * (1 - mu) + normalX1 * mu;
                            norm0[1] = normalY0 * (1 - mu) + normalY1 * mu;
                            norm0[2] = normalZ0 * (1 - mu) + normalZ1 * mu;
                        }
                        if (edge & 2) {
                            const mu = (surfaceLevel - e1) / (e2 - e1);
                            edge1[0] = x + 1;
                            edge1[1] = y;
                            edge1[2] = z + mu;
                            col1[0] = colorX1 * (1 - mu) + colorX2 * mu;
                            col1[1] = colorY1 * (1 - mu) + colorY2 * mu;
                            col1[2] = colorZ1 * (1 - mu) + colorZ2 * mu;
                            norm1[0] = normalX1 * (1 - mu) + normalX2 * mu;
                            norm1[1] = normalY1 * (1 - mu) + normalY2 * mu;
                            norm1[2] = normalZ1 * (1 - mu) + normalZ2 * mu;
                        }
                        if (edge & 4) {
                            const mu = (surfaceLevel - e3) / (e2 - e3);
                            edge2[0] = x + mu;
                            edge2[1] = y;
                            edge2[2] = z + 1;
                            col2[0] = colorX3 * (1 - mu) + colorX2 * mu;
                            col2[1] = colorY3 * (1 - mu) + colorY2 * mu;
                            col2[2] = colorZ3 * (1 - mu) + colorZ2 * mu;
                            norm2[0] = normalX3 * (1 - mu) + normalX2 * mu;
                            norm2[1] = normalY3 * (1 - mu) + normalY2 * mu;
                            norm2[2] = normalZ3 * (1 - mu) + normalZ2 * mu;
                        }
                        if (edge & 8) {
                            const mu = (surfaceLevel - e0) / (e3 - e0);
                            edge3[0] = x;
                            edge3[1] = y;
                            edge3[2] = z + mu;
                            col3[0] = colorX0 * (1 - mu) + colorX3 * mu;
                            col3[1] = colorY0 * (1 - mu) + colorY3 * mu;
                            col3[2] = colorZ0 * (1 - mu) + colorZ3 * mu;
                            norm3[0] = normalX0 * (1 - mu) + normalX3 * mu;
                            norm3[1] = normalY0 * (1 - mu) + normalY3 * mu;
                            norm3[2] = normalZ0 * (1 - mu) + normalZ3 * mu;
                        }
                        if (edge & 16) {
                            const mu = (surfaceLevel - e4) / (e5 - e4);
                            edge4[0] = x + mu;
                            edge4[1] = y + 1;
                            edge4[2] = z;
                            col4[0] = colorX4 * (1 - mu) + colorX5 * mu;
                            col4[1] = colorY4 * (1 - mu) + colorY5 * mu;
                            col4[2] = colorZ4 * (1 - mu) + colorZ5 * mu;
                            norm4[0] = normalX4 * (1 - mu) + normalX5 * mu;
                            norm4[1] = normalY4 * (1 - mu) + normalY5 * mu;
                            norm4[2] = normalZ4 * (1 - mu) + normalZ5 * mu;
                        }
                        if (edge & 32) {
                            const mu = (surfaceLevel - e5) / (e6 - e5);
                            edge5[0] = x + 1;
                            edge5[1] = y + 1;
                            edge5[2] = z + mu;
                            col5[0] = colorX5 * (1 - mu) + colorX6 * mu;
                            col5[1] = colorY5 * (1 - mu) + colorY6 * mu;
                            col5[2] = colorZ5 * (1 - mu) + colorZ6 * mu;
                            norm5[0] = normalX5 * (1 - mu) + normalX6 * mu;
                            norm5[1] = normalY5 * (1 - mu) + normalY6 * mu;
                            norm5[2] = normalZ5 * (1 - mu) + normalZ6 * mu;
                        }
                        if (edge & 64) {
                            const mu = (surfaceLevel - e7) / (e6 - e7)
                            edge6[0] = x + mu;
                            edge6[1] = y + 1;
                            edge6[2] = z + 1;
                            col6[0] = colorX7 * (1 - mu) + colorX6 * mu;
                            col6[1] = colorY7 * (1 - mu) + colorY6 * mu;
                            col6[2] = colorZ7 * (1 - mu) + colorZ6 * mu;
                            norm6[0] = normalX7 * (1 - mu) + normalX6 * mu;
                            norm6[1] = normalY7 * (1 - mu) + normalY6 * mu;
                            norm6[2] = normalZ7 * (1 - mu) + normalZ6 * mu;
                        }
                        if (edge & 128) {
                            const mu = (surfaceLevel - e4) / (e7 - e4);
                            edge7[0] = x;
                            edge7[1] = y + 1;
                            edge7[2] = z + mu;
                            col7[0] = colorX4 * (1 - mu) + colorX7 * mu;
                            col7[1] = colorY4 * (1 - mu) + colorY7 * mu;
                            col7[2] = colorZ4 * (1 - mu) + colorZ7 * mu;
                            norm7[0] = normalX4 * (1 - mu) + normalX7 * mu;
                            norm7[1] = normalY4 * (1 - mu) + normalY7 * mu;
                            norm7[2] = normalZ4 * (1 - mu) + normalZ7 * mu;
                        }
                        if (edge & 256) {
                            const mu = (surfaceLevel - e0) / (e4 - e0);
                            edge8[0] = x;
                            edge8[1] = y + mu;
                            edge8[2] = z;
                            col8[0] = colorX0 * (1 - mu) + colorX4 * mu;
                            col8[1] = colorY0 * (1 - mu) + colorY4 * mu;
                            col8[2] = colorZ0 * (1 - mu) + colorZ4 * mu;
                            norm8[0] = normalX0 * (1 - mu) + normalX4 * mu;
                            norm8[1] = normalY0 * (1 - mu) + normalY4 * mu;
                            norm8[2] = normalZ0 * (1 - mu) + normalZ4 * mu;
                        }
                        if (edge & 512) {
                            const mu = (surfaceLevel - e1) / (e5 - e1);
                            edge9[0] = x + 1;
                            edge9[1] = y + mu;
                            edge9[2] = z;
                            col9[0] = colorX1 * (1 - mu) + colorX5 * mu;
                            col9[1] = colorY1 * (1 - mu) + colorY5 * mu;
                            col9[2] = colorZ1 * (1 - mu) + colorZ5 * mu;
                            norm9[0] = normalX1 * (1 - mu) + normalX5 * mu;
                            norm9[1] = normalY1 * (1 - mu) + normalY5 * mu;
                            norm9[2] = normalZ1 * (1 - mu) + normalZ5 * mu;
                        }
                        if (edge & 1024) {
                            const mu = (surfaceLevel - e2) / (e6 - e2);
                            edge10[0] = x + 1;
                            edge10[1] = y + mu;
                            edge10[2] = z + 1;
                            col10[0] = colorX2 * (1 - mu) + colorX6 * mu;
                            col10[1] = colorY2 * (1 - mu) + colorY6 * mu;
                            col10[2] = colorZ2 * (1 - mu) + colorZ6 * mu;
                            norm10[0] = normalX2 * (1 - mu) + normalX6 * mu;
                            norm10[1] = normalY2 * (1 - mu) + normalY6 * mu;
                            norm10[2] = normalZ2 * (1 - mu) + normalZ6 * mu;
                        }
                        if (edge & 2048) {
                            const mu = (surfaceLevel - e3) / (e7 - e3);
                            edge11[0] = x;
                            edge11[1] = y + mu;
                            edge11[2] = z + 1;
                            col11[0] = colorX3 * (1 - mu) + colorX7 * mu;
                            col11[1] = colorY3 * (1 - mu) + colorY7 * mu;
                            col11[2] = colorZ3 * (1 - mu) + colorZ7 * mu;
                            norm11[0] = normalX3 * (1 - mu) + normalX7 * mu;
                            norm11[1] = normalY3 * (1 - mu) + normalY7 * mu;
                            norm11[2] = normalZ3 * (1 - mu) + normalZ7 * mu;
                        }
                        const triLen = triTable[cubeindex];
                        for (let i = 0; i < triLen.length; i++) {
                            if (triLen[i] === -1) {
                                break;
                            }
                            const e = edges[triLen[i]];
                            const c = colorEdges[triLen[i]];
                            const n = normalEdges[triLen[i]];
                            vertices[vIdx] = e[0];
                            normals[vIdx] = n[0];
                            colors[vIdx] = c[0];
                            vIdx++;
                            vertices[vIdx] = e[1];
                            normals[vIdx] = n[1];
                            colors[vIdx] = c[1];
                            vIdx++;
                            vertices[vIdx] = e[2];
                            normals[vIdx] = n[2];
                            colors[vIdx] = c[2];
                            vIdx++;
                            indices[idxCounter] = idxCounter;
                            idxCounter++;
                        }
                    }

                    /*if (this.get(x + this.width / 2, y + this.height / 2, z + this.depth / 2) < 0) {
                        const sphere = mainScene.add.box({ x, y, z, width: 1, depth: 1, height: 1 }, { phong: { color: 0 } });
                        sphere.castShadow = false;
                    } else {
                        const sphere = mainScene.add.box({ x, y, z, width: 1, depth: 1, height: 1 }, { phong: { color: 0xffffff } });
                        sphere.castShadow = false;
                    }*/
                }
            }
        }

        geo.setIndex(new THREE.BufferAttribute(indices.slice(0, idxCounter), 1));
        geo.setAttribute('position', new THREE.BufferAttribute(vertices.slice(0, vIdx), 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(normals.slice(0, vIdx), 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, vIdx), 3));
        //geo.computeVertexNormals();
        geo.attributes.position.needsUpdate = true;
        geo.attributes.normal.needsUpdate = true;
        geo.index.needsUpdate = true;
        return geo;
    }
}