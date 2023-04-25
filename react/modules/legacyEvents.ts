import push from './push'
import { PixelMessage } from '../typings/events'

export async function sendLegacyEvents(e: PixelMessage) {
  const streamLytics = localStorage.getItem('streamLytics')

  switch (e.data.eventName) {
    case 'vtex:pageInfo': {
      const { eventType, pageUrl, pageTitle } = e.data

      switch (eventType) {
        case 'homeView': {
          push('page_view', {
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })

          window.jstag.send(streamLytics, {
            event: 'page_view',
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })
          break
        }

        case 'categoryView': {
          push('page_view', {
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })

          window.jstag.send(streamLytics, {
            event: 'page_view',
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })
          break
        }

        case 'departmentView': {
          push('page_view', {
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })

          window.jstag.send(streamLytics, {
            event: 'page_view',
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })
          break
        }

        case 'emptySearchView': {
          break
        }

        case 'internalSiteSearchView': {
          const {
            search: { term },
          } = e.data

          push('search', {
            ...(term ? { search_term: term } : {}),
          })

          window.jstag.send(streamLytics, {
            event: 'search',
            ...(term ? { search_term: term } : {}),
          })
          break
        }

        case 'productView': {
          push('page_view', {
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })

          window.jstag.send(streamLytics, {
            event: 'page_view',
            page_title: pageTitle,
            page_location: pageUrl,
            page_type: eventType,
          })

          break
        }

        default: {
          push('page_view', {
            page_title: e.data.pageTitle,
            page_location: e.data.pageUrl,
            page_type: 'otherView',
          })

          window.jstag.send(streamLytics, {
            event: 'page_view',
            page_title: e.data.pageTitle,
            page_location: e.data.pageUrl,
            page_type: 'otherView',
          })
          break
        }
      }

      break
    }

    default: {
      break
    }
  }
}
