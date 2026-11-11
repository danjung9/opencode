import type { WarcodeEvent } from "@warcode/client"
import { useClient } from "./client"

type EventMetadata = {
  directory: string | undefined
}
type WarcodeEventMap = { [Type in WarcodeEvent["type"]]: Extract<WarcodeEvent, { type: Type }> }

export function useEvent() {
  const client = useClient()

  function subscribe(handler: (event: WarcodeEvent, metadata: EventMetadata) => void) {
    return client.event.listen(({ details }) => {
      if (details.type === "server.connected") return
      handler(details, { directory: details.location?.directory })
    })
  }

  function on<T extends WarcodeEvent["type"]>(
    type: T,
    handler: (event: WarcodeEventMap[T], metadata: EventMetadata) => void,
  ) {
    return client.event.on(type, (event) => {
      handler(event, { directory: event.location?.directory })
    })
  }

  return {
    subscribe,
    on,
  }
}
