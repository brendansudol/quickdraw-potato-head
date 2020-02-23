import React, { useEffect, useState } from "react"
import { Flex, Box } from "rebass"
import { makeFace } from "./utils"

const size = 256
const dataUrl = `${process.env.PUBLIC_URL}/data/doodles.json`

const styles = {
  svg: {
    border: "1px solid #ccc",
    width: "100%",
    height: "auto"
  },
  path: {
    fill: "none",
    stroke: "tomato",
    strokeWidth: 4
  }
}

const getFaces = (data, n = 9) => [...Array(n)].map(_ => makeFace(data))

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
    <div style={{ padding: "1rem", margin: "0 auto", maxWidth: 600 }}>
      <Flex flexWrap="wrap" mx={-2}>
        {faces.map((face, i) => (
          <Box key={i} px={2} py={2} width={1 / 3}>
            <svg
              viewBox={`0 0 ${size} ${size}`}
              style={styles.svg}
              preserveAspectRatio="none"
            >
              <path d={face.circle} style={styles.path} />
              <path d={face.nose} style={styles.path} />
              <path d={face.mouth} style={styles.path} />
              <path d={face.eyeLeft} style={styles.path} />
              <path d={face.eyeRight} style={styles.path} />
            </svg>
          </Box>
        ))}
      </Flex>

      <br />

      <button type="button" onClick={handleRefresh}>
        refresh
      </button>
    </div>
  )
})
