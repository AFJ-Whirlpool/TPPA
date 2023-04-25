window.dataLayer = window.dataLayer || []

export default function pushLytics(rawEvent: Record<string, any>) {
  const srcLytics = localStorage.getItem('srcLytics') || ''
  const streamLytics = localStorage.getItem('streamLytics') || ''
  if (srcLytics?.length) {
    window.jstag(streamLytics, { ...rawEvent, send_to: srcLytics })
  } else {
    window.jstag(streamLytics, rawEvent)
  }
}
