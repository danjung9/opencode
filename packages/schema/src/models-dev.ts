export * as ModelsDev from "./models-dev.js"

import { ephemeral, inventory } from "./event.js"

// Apply to bundled and refreshed catalogs so removed integrations cannot return on refresh.
export const supportsProvider = (id: string) =>
  !/^(?:302ai|aihubmix|alibaba|bailing|deepseek|iflowcn|jiekou|kimi-for-coding|kimi-code-plan|kuae-cloud|longcat|meituan|minimax|moark|modelscope|moonshotai|qihang-ai|qiniu-ai|scnet|sensenova|siliconflow|stepfun|tencent|volcengine|xiaomi|zai|zenmux|zhipuai)(?:-|$)/.test(id)

const Refreshed = ephemeral({
  type: "models-dev.refreshed",
  schema: {},
})
export const Event = { Refreshed, Definitions: inventory(Refreshed) }
