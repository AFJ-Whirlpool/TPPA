export interface AnalyticsData {
  location: string
  referrer: string
  expires: number
}

export interface AnalyticsDataWithOrigin extends AnalyticsData {
  origin: 'storage' | 'fresh'
}

export const UTM_SOURCE_PARAM = 'utm_source'
export const UTM_MEDIUM_PARAM = 'utm_medium'

export const analyticsURLParams = [
  UTM_SOURCE_PARAM,
  UTM_MEDIUM_PARAM,
  'utm_campaign',
  'gclid',
  'utm_term',
  'utm_content',
  'utm_id',
] as const

export function shouldInvalidateCurrentCampaign(
  location: Location,
  referrer: string,
  storageReferrer: string
) {
  const referrerURL = referrer ? new URL(referrer) : null

  // if user comes from a referring website
  if (
    referrerURL &&
    referrer !== storageReferrer &&
    referrerURL.host !== location.host
  ) {
    return true
  }

  const individualLocationParams = location.search.slice(1).split('&')

  return individualLocationParams.some((locationParam) => {
    return analyticsURLParams.some((campaignParam) =>
      locationParam.startsWith(`${campaignParam}=`)
    )
  })
}

const STORAGE_KEY_ANALYTICS_DATA = 'analytics:session'

export function getAnalyticsFromStorage(): AnalyticsData | null {
  let analyticsData = null

  try {
    const rawAnalyticsData = window.localStorage.getItem(
      STORAGE_KEY_ANALYTICS_DATA
    )

    analyticsData = rawAnalyticsData ? JSON.parse(rawAnalyticsData) : null
  } catch (e) {
    console.error(
      'Error while fetching original browser location from localStorage storage'
    )
  }

  return analyticsData
}

export async function saveAnalyticsOnStorage(analyticsData: AnalyticsData) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY_ANALYTICS_DATA,
      JSON.stringify(analyticsData)
    )
  } catch (e) {
    console.error(
      'Error while saving original browser location on localStorage storage'
    )
  }
}

export function currentDateInSeconds() {
  return Math.floor(Date.now() / 1000)
}

export const THIRTY_MIN_IN_SECONDS = 30 * 60

export function isStorageExpired(expiresIn: number, now: number) {
  return now - expiresIn > 0
}

export function renewExpirationDate() {
  return currentDateInSeconds() + THIRTY_MIN_IN_SECONDS
}
