import { canUseDOM } from 'vtex.render-runtime'

import { sendEnhancedEcommerceEvents } from './modules/enhancedEcommerceEvents'
import { sendExtraEvents } from './modules/extraEvents'
import { PixelMessage } from './typings/events'

export default function () {
  return null
}

export function handleEvents(e: PixelMessage) {
  sendEnhancedEcommerceEvents(e)
  sendExtraEvents(e)
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
