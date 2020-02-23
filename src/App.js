import React, { useEffect, useState } from "react"
import { makeFace } from "./utils"

const size = 256
const dataUrl = `${process.env.PUBLIC_URL}/data/doodles.json`

const styles = {
  svg: {
    border: "1px solid #ccc"
  },
  path: {
    fill: "none",
    stroke: "tomato",
    strokeWidth: 3
  }
}

const getFaces = (data, n = 4) => [...Array(n)].map(_ => makeFace(data))

export const App = React.memo(() => {
  const [data, setData] = useState(null)
  const [faces, setFaces] = useState(null)

  useEffect(() => {
    fetch(dataUrl)
      .then(response => response.json())
      .then(data => {
        setData(data)
        setFaces(getFaces(data))
      })
  }, [])

  function handleRefresh() {
    setFaces(getFaces(data))
  }

  if (!faces) return null

  return (
    <div style={{ padding: "1rem", maxWidth: 600 }}>
      {faces.map((face, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={styles.svg}
        >
          <path d={face.circle} style={styles.path} />
          <path d={face.nose} style={styles.path} />
          <path d={face.mouth} style={styles.path} />
          <path d={face.eyeLeft} style={styles.path} />
          <path d={face.eyeRight} style={styles.path} />
        </svg>
      ))}

      <br />

      <button type="button" onClick={handleRefresh}>
        refresh
      </button>
    </div>
  )
})
