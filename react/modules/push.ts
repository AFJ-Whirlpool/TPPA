window.dataLayer = window.dataLayer || []

export default function push(eventName: string, rawEvent: Record<string, any>) {
  const ga4Id = localStorage.getItem('ga4Vtex') || ''
  if (ga4Id?.length) {
    window.gtag('event', eventName, { ...rawEvent, send_to: ga4Id })
  } else {
    window.gtag('event', eventName, rawEvent)
  }
}
