import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    // Scene Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 220)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Path Geometry (3D Wave)
    const numPoints = 200
    const amplitudeX = 40
    const amplitudeY = 30
    const pathPoints: THREE.Vector3[] = []

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const x = Math.sin(t * Math.PI * 2 * 3) * amplitudeX
      const y = Math.cos(t * Math.PI * 2 * 2) * amplitudeY
      const z = (t - 0.5) * 300
      pathPoints.push(new THREE.Vector3(x, y, z))
    }

    const curve = new THREE.CatmullRomCurve3(pathPoints)
    const tubeRadius = 3
    const radialSegments = 100

    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      numPoints,
      tubeRadius,
      radialSegments,
      false
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const frenetFrames = (tubeGeometry as any).computeFrenetFrames(numPoints, false)
    const normals = frenetFrames.normals as THREE.Vector3[]
    const binormals = frenetFrames.binormals as THREE.Vector3[]

    // Particle Distribution
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 5000 : 15000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random()
      const radius = Math.random() * tubeRadius

      const point = new THREE.Vector3()
      const tangent = new THREE.Vector3()
      curve.getPointAt(t, point)
      curve.getTangentAt(t, tangent)

      const normal = normals[Math.floor(t * (numPoints - 1))]
      const binormal = binormals[Math.floor(t * (numPoints - 1))]

      const angle = Math.random() * Math.PI * 2
      const radialOffset = normal
        .clone()
        .multiplyScalar(Math.cos(angle) * radius)
        .add(binormal.clone().multiplyScalar(Math.sin(angle) * radius))

      radialOffset.x += (Math.random() - 0.5) * 0.5
      radialOffset.y += (Math.random() - 0.5) * 0.5
      radialOffset.z += (Math.random() - 0.5) * 0.5

      point.add(radialOffset)

      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Material & Mesh
    const material = new THREE.PointsMaterial({
      color: 0xfdf0d5,
      size: 0.4,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Animation Loop
    let time = 0
    let animationFrameId: number

    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.002
      particles.rotation.y = time * 0.5
      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    function handleResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
