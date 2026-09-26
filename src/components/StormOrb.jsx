import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { voiceLevel } from '../services/voiceLevel'

// STORM: a living particle sphere. Swirl while thinking, gentle pulse while listening,
// swells with the voice while speaking. Palette = TOP (purple, teal, gold).
const PALETTE = {
  idle: { a: 0x6b35a8, b: 0x1bbfbf, swirl: 0, spin: 0.16 },
  listening: { a: 0x1bbfbf, b: 0xf5f2ec, swirl: 0.15, spin: 0.22 },
  thinking: { a: 0x6b35a8, b: 0xc9a84c, swirl: 1, spin: 0.75 },
  speaking: { a: 0x6b35a8, b: 0xc9a84c, swirl: 0.25, spin: 0.3 },
}

const VERT = /* glsl */ `
  uniform float uTime, uLevel, uSwirl, uSpin, uPx; attribute float aSeed;
  varying float vGlow; varying float vMix;
  void main() {
    vec3 p = normalize(position);
    float lat = p.y;
    float a = uTime * (uSpin + 0.35 * uSwirl * sin(lat * 6.2832)) + lat * uSwirl * 1.6;
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    float wave = sin(lat * 7.0 + uTime * 1.3 + aSeed * 6.283) * 0.5 + 0.5;
    float r = 1.0 + 0.03 * wave + 0.05 * uSwirl * sin(uTime * 2.5 + p.x * 7.0)
              + uLevel * (0.10 + 0.34 * aSeed);
    p *= r;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float rim = pow(1.0 - abs(normalize(normalMatrix * p).z), 1.6);
    vGlow = 0.62 + rim * 1.1 + uLevel * 0.7;
    vMix = wave;
    gl_PointSize = (2.1 + aSeed * 2.0 + uLevel * 2.8) * uPx * (5.0 / -mv.z);
  }`

const FRAG = /* glsl */ `
  uniform vec3 uColA, uColB; varying float vGlow, vMix;
  void main() {
    vec2 d = gl_PointCoord - 0.5; float m = smoothstep(0.5, 0.0, length(d));
    gl_FragColor = vec4(mix(uColA, uColB, vMix) * vGlow, m * min(vGlow, 1.0));
  }`

function CssOrb({ state, mode }) {
  return (
    <div className={`storm-orb storm-orb--${state} storm-orb--mode-${mode}`} aria-label={`STORM is ${state}`}>
      <div className="storm-orb__field storm-orb__field--outer" />
      <div className="storm-orb__field storm-orb__field--inner" />
      <div className="storm-orb__glow" />
      <div className="storm-orb__ring storm-orb__ring--one" />
      <div className="storm-orb__ring storm-orb__ring--two" />
      <div className="storm-orb__ring storm-orb__ring--three" />
      <div className="storm-orb__shell">
        <div className="storm-orb__rim" />
        <div className="storm-orb__water storm-orb__water--one" />
        <div className="storm-orb__water storm-orb__water--two" />
        <div className="storm-orb__water storm-orb__water--three" />
        <div className="storm-orb__light" />
        <div className="storm-orb__core" />
      </div>
      <div className="storm-orb__reflection" />
      <div className="storm-orb__signal" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    </div>
  )
}

export default function StormOrb({ state = 'idle', mode = 'chat' }) {
  const host = useRef(null)
  const stateRef = useRef(state)
  const [webgl, setWebgl] = useState(true)
  stateRef.current = state

  useEffect(() => {
    const el = host.current
    if (!el) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setWebgl(false)
      return undefined
    }

    const small = window.innerWidth < 768
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2))
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)
    camera.position.z = 5.2

    const N = small ? 2600 : 7500
    const pos = new Float32Array(N * 3)
    const seed = new Float32Array(N)
    for (let i = 0; i < N; i += 1) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = i * 2.399963
      pos.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3)
      seed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uLevel: { value: 0 }, uSwirl: { value: 0 }, uSpin: { value: 0.16 },
        uPx: { value: renderer.getPixelRatio() },
        uColA: { value: new THREE.Color(PALETTE.idle.a) },
        uColB: { value: new THREE.Color(PALETTE.idle.b) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    })
    const orb = new THREE.Points(geo, mat)
    orb.scale.setScalar(1.55)
    scene.add(orb)

    const resize = () => {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const colA = new THREE.Color(PALETTE.idle.a)
    const colB = new THREE.Color(PALETTE.idle.b)
    const tmp = new THREE.Color()
    let level = 0
    let swirl = 0
    let spin = 0.16
    const clock = new THREE.Clock()

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const st = stateRef.current
      const p = PALETTE[st] || PALETTE.idle
      const t = clock.elapsedTime
      let target
      if (st === 'speaking') target = voiceLevel.current
      else if (st === 'listening') target = 0.1 + Math.sin(t * 5) * 0.05
      else if (st === 'thinking') target = 0.16 + Math.sin(t * 4) * 0.06
      else target = 0.04 + Math.sin(t * 1.2) * 0.02
      level += (target - level) * Math.min(dt * 14, 1)
      swirl += (p.swirl - swirl) * Math.min(dt * 3, 1)
      spin += (p.spin - spin) * Math.min(dt * 3, 1)
      colA.lerp(tmp.set(p.a), Math.min(dt * 4, 1))
      colB.lerp(tmp.set(p.b), Math.min(dt * 4, 1))

      const u = mat.uniforms
      u.uTime.value += reduce ? dt * 0.2 : dt
      u.uLevel.value = reduce ? level * 0.4 : level
      u.uSwirl.value = reduce ? 0 : swirl
      u.uSpin.value = spin
      u.uColA.value.copy(colA)
      u.uColB.value.copy(colB)
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  if (!webgl) return <CssOrb state={state} mode={mode} />
  return (
    <div
      ref={host}
      className={`storm-orb-gl storm-orb-gl--${state} storm-orb-gl--mode-${mode}`}
      role="img"
      aria-label={`STORM is ${state}`}
    />
  )
}
