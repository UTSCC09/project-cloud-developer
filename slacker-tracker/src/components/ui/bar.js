import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import PropTypes from 'prop-types'

Box.propTypes = {
  height: PropTypes.number,
  color: PropTypes.string,
  lightColor: PropTypes.string
}

function Box (props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    // ref.current.rotation.x += 0.01
    // ref.current.rotation.y += 0.01
    // ref.current.rotation.z += 0.01
  })

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      // scale={function (event) { if (event.hovered) { return 1.01 } else if (event.clicked) { return 0.09 } else { return 1 } } }
      scale={hovered ? 1.06 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[2, props.height, 0.3]} />
      <meshStandardMaterial
        color={hovered ? props.lightColor : props.color}
        // roughness=roughness
        // metalness=metalness

        // roughnessMap: roughnessMap,
        // metalnessMap: metalnessMap,

        // envMap: envMap, // important -- especially for metals!
        // envMapIntensity: envMapIntensity
      />
    </mesh>
  )
}

Bar.propTypes = {
  workTime: PropTypes.number,
  playTime: PropTypes.number,
  offlineTime: PropTypes.number,
  unallocatedTime: PropTypes.number
}

export default function Bar (props) {
  function color (minutes, category) {
    let hue = 220
    // colors go from 220 to 0 hue
    // good range is from 100 to 150 (green) (150-100=50)
    if (category === 'work') {
      // optimal is 30 to 60 hours a week
      // => 1800 to 3600 minutes a week
      // => we need 50 hues every 1800
      // => rate of color is 0.027777778
      hue = hue - 0.027777778 * minutes
      if (hue < 0) hue = 0
    } else if (category === 'play') {
      // optimal is 3 to 20 hours a week
      // => 180 to 1200 minutes a week
      // => we need 50 hues every 1020
      // => rate of color is 0.049019608
      hue = hue - 0.049019608 * minutes
      if (hue < 0) hue = 0
    } else if (category === 'offline') {
      // optimal is 90 to 120 hours a week
      // => 5400 to 7200 minutes a week
      // => we need 50 hues every 1800
      // => rate of color is 0.027777778
      hue = hue - 0.027777778 * minutes
      if (hue < 0) hue = 0
    } else if (category === 'unallocated') {
      // optimal is 90 to 120 hours a week
      // => 0 to 60 minutes a week
      // => we need 50 hues every 60
      // => rate of color is 0.833333333
      hue = hue - 0.833333333 * minutes
      if (hue < 0) hue = 0
    }

    return 'hsl(' + hue + ', 89%, 79%)'
  }

  // const shift = 4

  return (
    // <Canvas camera={{ fov: 75, position: [0, 0, 30] }}>
    <Canvas>
      <ambientLight intensity={0.1} />
      <spotLight intensity={0.6} position={[-7, 7, 7]} angle={0.5} penumbra={1} />
      {/* <spotLight intensity={6} position={[-5.5, 0, 1]} angle={180} penumbra={0.5} /> */}
      <pointLight intensity={0.1} position={[-7, 7, 7]} />
      <Box position={[-5.5, -3.2 + props.workTime / (600 * 2), 0]} height={props.workTime / 600} color={color(props.workTime, 'work')} lightColor={color(props.workTime + 200, 'work')}/>
      <Box position={[-1.9, -3.2 + props.playTime / (510 * 2), 0]} height={props.playTime / 510} color={color(props.playTime, 'play')} lightColor={color(props.playTime + 100, 'play')}/>
      <Box position={[1.7, -3.2 + props.offlineTime / (600 * 2), 0]} height={props.offlineTime / 600} color={color(props.offlineTime, 'offline')} lightColor={color(props.offlineTime + 200, 'offline')}/>
      <Box position={[5.3, -3.2 + props.unallocatedTime / (30 * 2), 0]} height={props.unallocatedTime / 30} color={color(props.unallocatedTime, 'unallocated')} lightColor={color(props.unallocatedTime + 10, 'unallocated')}/>
    </Canvas>
  )
}
