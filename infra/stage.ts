export const domain = (() => {
  if ($app.stage === "production") return "warcode.ai"
  if ($app.stage === "dev") return "dev.warcode.ai"
  return `${$app.stage}.dev.warcode.ai`
})()

export const zoneID = "430ba34c138cfb5360826c4909f99be8"
export const awsStage = $app.stage === "production" ? "production" : "dev"
export const deployStats = $app.stage === awsStage
