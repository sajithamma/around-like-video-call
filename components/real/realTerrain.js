import style from './style.module.css';
import * as THREE from 'three';
import { useEffect } from 'react';



export default function Terrain() {

    const buildTerrain = () => {

        // Canvas
        const canvas = document.querySelector('#terrain')

        // Scene
        const scene = new THREE.Scene()

        // Objects
        const geometry = new THREE.PlaneBufferGeometry(10, 10, 64, 64);

        const loader = new THREE.TextureLoader();

        const texture = loader.load('/texture/texture.jpg');
        const height = loader.load('/texture/height.png');
        const alpha = loader.load('/texture/alpha.png');

        const material = new THREE.MeshStandardMaterial({

            color: 'grey',
            map: texture,
            displacementMap: height,
            displacementScale: 0.6,
            alphaMap: alpha,
            transparent: true,
            depthTest: false


        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = 118;

        scene.add(plane);


        const pointLight = new THREE.PointLight('#60dede', 2)

        pointLight.position.x = 2
        pointLight.position.y = 3
        pointLight.position.z = 4

        scene.add(pointLight)

        const sizes = {

            width: canvas.offsetWidth,
            height: canvas.offsetHeight
        }

        const resizeCanvas = () => {


            // Update sizes
            sizes.width = canvas.offsetWidth
            sizes.height = canvas.offsetHeight

            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        }

        window.addEventListener('resize', resizeCanvas);
        window.onorientationchange = resizeCanvas;



        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true
        })

        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.x = 0
        camera.position.y = 0
        camera.position.z = 3

        scene.add(camera)

        let mouseY = 0;

        document.addEventListener('mousemove', animateTerrine);

        function animateTerrine(event) {

            mouseY = event.clientY;

        }

        const clock = new THREE.Clock();

        canvas.style.display = 'block';

        const tick = () => {

            const elapsedTime = clock.getElapsedTime()

            // Update objects
            //sphere.rotation.y = .5 * elapsedTime

            plane.rotation.z = 0.1 * elapsedTime;
            //plane.material.displacementScale = 0.3 + mouseY * .0008;

            // Update Orbital Controls
            // controls.update()

            // Render
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)


        }

        tick()





    }

    useEffect(() => {

        buildTerrain();

    })

    return (<>

        <canvas id="terrain" className={style.terrain}></canvas>

    </>)
}