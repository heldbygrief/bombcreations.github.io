document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas")
  const ctx = canvas.getContext("2d")
  const plantToolButton = document.getElementById("plantTool")
  const harvestToolButton = document.getElementById("harvestTool")
  const messageBox = document.getElementById("messageBox")

  const GRID_SIZE = 10 // 10x10 grid
  const TILE_SIZE = canvas.width / GRID_SIZE // Size of each grid square

  const gardenGrid = [] // Stores plant data: { type: 'carrot', stage: 0, plantedTime: Date.now() }
  let selectedTool = "plant" // 'plant' or 'harvest'

  const PLANTS_DATA = {
    carrot: {
      name: "Carrot",
      stages: [
        { color: "#8B4513", label: "Seedling" }, // Brown
        { color: "#FFA500", label: "Growing" }, // Orange
        { color: "#FF8C00", label: "Mature" }, // Darker Orange
      ],
      growthTime: 5000, // Time in ms for each stage
      harvestValue: "1 Carrot",
    },
  }

  function initializeGarden() {
    for (let r = 0; r < GRID_SIZE; r++) {
      gardenGrid[r] = []
      for (let c = 0; c < GRID_SIZE; c++) {
        gardenGrid[r][c] = null // Null means empty plot
      }
    }
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#a0d0a0" // Light green for grid lines
    ctx.lineWidth = 1

    for (let i = 0; i <= GRID_SIZE; i++) {
      // Draw horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * TILE_SIZE)
      ctx.lineTo(canvas.width, i * TILE_SIZE)
      ctx.stroke()

      // Draw vertical lines
      ctx.beginPath()
      ctx.moveTo(i * TILE_SIZE, 0)
      ctx.lineTo(i * TILE_SIZE, canvas.height)
      ctx.stroke()
    }
  }

  function drawPlant(row, col, plant) {
    if (!plant) return

    const x = col * TILE_SIZE
    const y = row * TILE_SIZE
    const plantData = PLANTS_DATA[plant.type]

    if (!plantData) return

    const stageIndex = Math.min(plant.stage, plantData.stages.length - 1)
    const stageColor = plantData.stages[stageIndex].color

    // Draw a simple colored square for the plant
    ctx.fillStyle = stageColor
    ctx.fillRect(x + TILE_SIZE * 0.1, y + TILE_SIZE * 0.1, TILE_SIZE * 0.8, TILE_SIZE * 0.8)

    // Optionally, draw a small label
    ctx.fillStyle = "#333"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(plantData.stages[stageIndex].label, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 5)
  }

  function renderGame() {
    drawGrid()
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (gardenGrid[r][c]) {
          drawPlant(r, c, gardenGrid[r][c])
        }
      }
    }
  }

  function updateGame() {
    const now = Date.now()
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const plant = gardenGrid[r][c]
        if (plant && plant.stage < PLANTS_DATA[plant.type].stages.length - 1) {
          const timeElapsed = now - plant.plantedTime
          const requiredTimeForNextStage = PLANTS_DATA[plant.type].growthTime * (plant.stage + 1)

          if (timeElapsed >= requiredTimeForNextStage) {
            plant.stage++
            plant.plantedTime = now // Reset planted time for next stage calculation
            showMessage(`A ${PLANTS_DATA[plant.type].name} in row ${r}, col ${c} grew to stage ${plant.stage + 1}!`)
          }
        }
      }
    }
    renderGame()
    requestAnimationFrame(updateGame) // Keep the game loop running
  }

  function showMessage(msg, duration = 3000) {
    messageBox.textContent = msg
    clearTimeout(messageBox.timeout)
    messageBox.timeout = setTimeout(() => {
      messageBox.textContent = "Select a tool."
    }, duration)
  }

  // Event Listeners
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const col = Math.floor(x / TILE_SIZE)
    const row = Math.floor(y / TILE_SIZE)

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      if (selectedTool === "plant") {
        if (gardenGrid[row][col] === null) {
          gardenGrid[row][col] = {
            type: "carrot", // Only carrot for now
            stage: 0,
            plantedTime: Date.now(),
          }
          showMessage(`Planted a carrot seed at row ${row}, col ${col}!`)
        } else {
          showMessage("This plot is already occupied!")
        }
      } else if (selectedTool === "harvest") {
        const plant = gardenGrid[row][col]
        if (plant && plant.stage === PLANTS_DATA[plant.type].stages.length - 1) {
          showMessage(`Harvested ${PLANTS_DATA[plant.type].harvestValue} from row ${row}, col ${col}!`)
          gardenGrid[row][col] = null // Clear the plot
        } else if (plant) {
          showMessage(
            `This ${PLANTS_DATA[plant.type].name} is not fully grown yet (Stage ${plant.stage + 1}/${PLANTS_DATA[plant.type].stages.length})!`,
          )
        } else {
          showMessage("Nothing to harvest here!")
        }
      }
      renderGame() // Re-render after action
    }
  })

  plantToolButton.addEventListener("click", () => {
    selectedTool = "plant"
    plantToolButton.classList.add("active")
    harvestToolButton.classList.remove("active")
    showMessage("Plant tool selected. Click on an empty plot to plant a seed.")
  })

  harvestToolButton.addEventListener("click", () => {
    selectedTool = "harvest"
    harvestToolButton.classList.add("active")
    plantToolButton.classList.remove("active")
    showMessage("Harvest tool selected. Click on a fully grown plant to harvest.")
  })

  // Start the game
  initializeGarden()
  updateGame() // This will call renderGame and then loop
})
