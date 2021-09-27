let mainScene;
let brushSize = 3;
let brushColor = [Math.random() * 0.75, Math.random() * 0.75, Math.random() * 0.75];
brushColor = [0.75, 0.75, 0.75];
const rSlider = document.getElementById("r");
const gSlider = document.getElementById("g");
const bSlider = document.getElementById("b");
const rgbDisplay = document.getElementById("rgbDisplay");
const shapeDropdown = document.getElementById("shape");
const gltfExporter = new THREE.GLTFExporter();
const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString(text, filename) {

    save(new Blob([text], { type: 'text/plain' }), filename);

}
let doPlace = false;
const sphereDistance = (spherePos, point, radius) => {
    return spherePos.distanceTo(point) - radius;
}
const abs = (v) => {
    v.x = Math.abs(v.x);
    v.y = Math.abs(v.y);
    v.z = Math.abs(v.z);
    return v;
}
const vmax = (v) => Math.max(Math.max(v.x, v.y), v.z);
const boxDistance = (boxCenter, point, radius) => {
    return vmax(abs(point.sub(boxCenter)).subScalar(radius));
}
const coneDistance = (coneCenter, point, radius) => {
    point.sub(coneCenter);
    const q = new THREE.Vector2(Math.hypot(point.x, point.z), point.y);
    const r1 = radius;
    const r2 = 0;
    const height = radius * 1.5;
    const b = (r1 - r2) / height;
    const a = Math.sqrt(1.0 - b * b);
    const k = q.dot(new THREE.Vector2(-b, a));

    if (k < 0.0) return q.length() - r1;
    if (k > a * height) return q.clone().sub(new THREE.Vector2(0.0, height)).length() - r2;

    return q.dot(new THREE.Vector2(a, b)) - r1;
}
let getDistanceFunction = () => {
    return ({
        "sphere": sphereDistance,
        "cube": boxDistance,
        "cone": coneDistance
    })[shapeDropdown.value];
}
const simplex = new SimplexNoise();
let calcMesh = false;
class MainScene extends Scene3D {
    constructor() {
        super('MainScene')
    }

    init() {

        this.renderer.setPixelRatio(2)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    preload() {}

    async create() {
        this.warpSpeed("-ground", "-orbitControls", "-light");
        mainScene = this;
        let size = 100;
        this.size = size;
        this.marchingcubes = new MarchingCubes(size, size, size);
        for (let x = -size / 2; x < size / 2; x += 1) {
            for (let z = -size / 2; z < size / 2; z += 1) {
                for (let y = -size / 2; y < size / 2; y += 1) {
                    if (y < -size / 2.5 && y > -size / 2.1 && x > -size / 2.1 && x < size / 2.1 && z > -size / 2.1 && z < size / 2.1) {
                        this.marchingcubes.set(x + size / 2, y + size / 2, z + size / 2, 1 /*simplex.noise3D(x / 40, y / 40, z / 40)*/ );
                    } else {
                        this.marchingcubes.set(x + size / 2, y + size / 2, z + size / 2, -1 /*simplex.noise3D(x / 40, y / 40, z / 40)*/ );
                    }
                }
            }
        }
        //this.marchingcubes.addSpheres();
        console.time();
        const terrainGeo = new THREE.BufferGeometry();
        this.marchingcubes.setMesh(terrainGeo, 0);
        terrainGeo.castShadow = true;
        terrainGeo.receiveShadow = true;
        const terrainMat = new THREE.MeshStandardMaterial({
            //color: new THREE.Color(0.75, 0.75, 0.75),
            vertexColors: true,
            side: THREE.DoubleSide
        });
        const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
        this.terrainMesh = terrainMesh;
        this.scene.add(terrainMesh);
        console.timeEnd();
        // this.brushSphere = this.add.sphere({ radius: 1 }, { phong: { color: 0xffff00, transparent: true, opacity: 0.5 } });
        this.brushParent = new ExtendedObject3D();
        const selectMat = new THREE.MeshPhongMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
        const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        const coneGeo = new THREE.ConeGeometry(1, 1.5);
        const brushSphere = new THREE.Mesh(sphereGeo, selectMat);
        const brushCube = new THREE.Mesh(boxGeo, selectMat);
        const brushCone = new THREE.Mesh(coneGeo, selectMat);
        brushCone.position.y = 0.5;
        brushSphere.castShadow = false;
        brushCube.castShadow = false;
        brushCone.castShadow = false;
        this.brushParent.add(brushSphere);
        this.brushParent.add(brushCube);
        this.brushParent.add(brushCone);
        this.brushShapes = {
            "cone": brushCone,
            "cube": brushCube,
            "sphere": brushSphere
        }
        this.scene.add(this.brushParent);
        //this.brushSphere.sphere = this.add.sphere({ radius: 1 }, { phong: { color: 0xffff00, transparent: true, opacity: 0.5 } });
        //this.brushSphere.cube = this.add.box({}, { phong: { color: 0xffff00, transparent: true, opacity: 0.5 } });
        //this.brushSphere.add(this.brushSphere.sphere);
        // this.brushSphere.add(this.brushSphere.cube);
        this.brushParent.castShadow = false;
        this.player = new ExtendedObject3D();
        this.player.velocity = new THREE.Vector3();
        this.firstPersonControls = new FirstPersonControls(this.camera, this.player, {});
        const t = .4,
            n = this.lights.hemisphereLight({ skyColor: 16777215, groundColor: 0, intensity: t }),
            i = this.lights.ambientLight({ color: 16777215, intensity: t }),
            r = this.lights.directionalLight({ color: 16777215, intensity: t });
        r.position.set(30, 50, 30);
        const o = 80;
        r.shadow.camera.top = o, r.shadow.camera.bottom = -o, r.shadow.camera.left = -o, r.shadow.camera.right = o, r.shadow.mapSize.set(2048, 2048);
        r.shadow.bias = -0.0015;
        this.directionalLight = r;
        const shadowHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
        //this.scene.add(shadowHelper);
        this.add.existing(this.directionalLight.target)
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.initiated = true;
    }
    update(time, delta) {
        if (!this.initiated) {
            return;
        }

        stats.begin();
        this.terrainMesh.castShadow = true;
        this.terrainMesh.receiveShadow = true;
        //const newColorR = simplex.noise3D(performance.now() / 2000, performance.now() / 500, performance.now() / 1000);
        //const newColorG = simplex.noise3D(performance.now() / 500, performance.now() / 1000, performance.now() / 2000);
        //const newColorB = simplex.noise3D(performance.now() / 100, performance.now() / 2000, performance.now() / 500);
        // brushColor = [0.2 + newColorR * 0.6, 0.2 + newColorG * 0.6, 0.2 + newColorB * 0.6];
        const rVal = rSlider.value;
        const gVal = gSlider.value;
        const bVal = bSlider.value;
        brushColor = [rVal * 0.75, gVal * 0.75, bVal * 0.75];
        rgbDisplay.style.backgroundColor = `rgb(${brushColor.map(x => x * 255).join(", ")})`;
        this.delta = delta;
        this.timeScale = this.delta / 16.66;
        //this.firstPersonControls.update(0, 0);
        this.brushParent.scale.x = brushSize - 1;
        this.brushParent.scale.y = brushSize - 1;
        this.brushParent.scale.z = brushSize - 1;
        Object.values(this.brushShapes).forEach(brushShape => {
            brushShape.visible = false;
        })
        this.brushShapes[shapeDropdown.value].visible = true;
        const vec = new THREE.Vector3();
        this.camera.getWorldDirection(vec);
        const angle = Math.atan2(vec.x, vec.z);
        if (keys["w"]) {
            this.player.position.x += Math.sin(angle) * this.timeScale;
            this.player.position.z += Math.cos(angle) * this.timeScale;
        }
        if (keys["s"]) {
            this.player.position.x -= Math.sin(angle) * this.timeScale;
            this.player.position.z -= Math.cos(angle) * this.timeScale;
        }
        if (keys["a"]) {
            this.player.position.x += Math.sin(angle + Math.PI / 2) * this.timeScale;
            this.player.position.z += Math.cos(angle + Math.PI / 2) * this.timeScale;
        }
        if (keys["d"]) {
            this.player.position.x += Math.sin(angle - Math.PI / 2) * this.timeScale;
            this.player.position.z += Math.cos(angle - Math.PI / 2) * this.timeScale;
        }
        if (keys[" "]) {
            this.player.position.y += 1 * this.timeScale;
        }
        if (keys["c"]) {
            this.player.position.y -= 1 * this.timeScale;
        }
        this.firstPersonControls.update(0, 0);
        //this.player.needsUpdate = true;
        //this.player.position.y -= 1;
        //this.player.velocity.multiplyScalar(0.9);
        //this.player.position.add(this.player.velocity);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: 0, y: 0 }, mainScene.camera);
        const result = raycaster.intersectObject(mainScene.terrainMesh);
        this.result = result;
        if ((keys["p"] || keys["r"]) && calcMesh) {
            if (result.length > 0) {
                calcMesh = false;
                const point = result[0].point;
                point.x += mainScene.size / 2;
                point.y += mainScene.size / 2;
                point.z += mainScene.size / 2;
                mainScene.marchingcubes.makeShape(brushSize, brushColor, point, keys["r"] ? -1 : 1, getDistanceFunction());
                mainScene.marchingcubes.setMesh(mainScene.terrainMesh.geometry, 0);
            }
        } else {
            if (!calcMesh) {
                //this.terrainMesh.geometry.computeVertexNormals();
                //this.terrainMesh.geometry.needsUpdate = true;
                calcMesh = true;
            }
        }
        if (result.length > 0) {
            this.brushParent.position.copy(result[0].point);
        } else {
            this.brushParent.position.copy(new THREE.Vector3(1000, 1000, 1000))
        }
        stats.end();
    }
}
let keys = {};
document.onkeydown = (e) => {
    keys[e.key] = true;
    if (e.key === "l") {
        brushSize += 1;
    }
    if (e.key === "k") {
        brushSize -= 1;
    }
    if (e.key === "n") {
        mainScene.terrainMesh.geometry.computeVertexNormals();
        mainScene.terrainMesh.geometry.needsUpdate = true;
    }
    brushSize = Math.min(Math.max(brushSize, 2), 10);
}
document.onkeyup = (e) => {
    keys[e.key] = false;
}
let mouseX = 0;
let mouseY = 0;
document.onmousemove = (e) => {
    if (document.pointerLockElement) {
        mainScene.firstPersonControls.update(e.movementX * 0.25, e.movementY * 0.25);

    }
    // doPlace = true;
    // mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    // mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}
document.onclick = (e) => {
    stats.showPanel(0);
    document.querySelector("canvas").requestPointerLock();
    let multiplier = 1;
    if (e.button == 2) {
        multiplier = -1;
    }
    if (document.pointerLockElement) {
        const result = mainScene.result;
        if (result.length > 0) {
            calcMesh = false;
            const point = result[0].point;
            point.x += mainScene.size / 2;
            point.y += mainScene.size / 2;
            point.z += mainScene.size / 2;
            let multiplier = 1;
            if (e.button === 2) {
                multiplier = -1;
            }
            mainScene.marchingcubes.makeShape(brushSize, brushColor, point, multiplier, getDistanceFunction());
            mainScene.marchingcubes.setMesh(mainScene.terrainMesh.geometry, 0);
        }
    }

}
document.getElementById("sliders").onclick = (e) => {
    e.stopPropagation();
}
document.getElementById("gltfExport").onclick = (e) => {
    gltfExporter.parse(mainScene.terrainMesh, function(result) {

        const output = JSON.stringify(result, null, 2);
        saveString(output, 'scene.gltf');
    }, {
        trs: false,
        onlyVisible: false,
        truncateDrawRange: false,
        binary: false,
        maxTextureSize: 4096
    })
}
rSlider.onclick = (e) => {
    e.stopPropagation();
}
gSlider.onclick = (e) => {
    e.stopPropagation();
}
bSlider.onclick = (e) => {
    e.stopPropagation();
}
shapeDropdown.onclick = (e) => {
    e.stopPropagation();
}
var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
PhysicsLoader('./lib/moz', () => new Project({ scenes: [MainScene], antialias: true }))