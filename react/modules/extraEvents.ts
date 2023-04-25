import push from './push'
// import pushLytics from './pushLytics'
import { PixelMessage } from '../typings/events'
import { useRuntime } from 'vtex.render-runtime'
import { useFullSession } from 'vtex.session-client'

export async function sendExtraEvents(e: PixelMessage) {
  const datosPag = useRuntime()
  const { data: dataSession } = useFullSession()
  const srcLytics = localStorage.getItem('srcLytics')
  const streamLytics = localStorage.getItem('streamLytics')

  const getCookie = (name: any) => {
    if (!name) return false

    const newName = name?.toString().concat('=')
    const cookiesItems = window?.document?.cookie
    const split = cookiesItems?.split(';')

    let i = 0

    while (i < split?.length) {
      let c = split[i]

      while (c.charAt(0) === ' ') c = c.substring(1)
      if (c.indexOf(newName) !== -1)
        return decodeURI(c.substring(newName.length, c.length))
      i += 1
    }
    return null
  }

  switch (e.data.eventName) {
    case 'vtex:pageView': {
      const { pageUrl, pageTitle, eventType } = e.data

      if (eventType) {
        push('page_view', {
          page_title: pageTitle,
          page_location: pageUrl,
          page_type: eventType,
        })
      }

      window.jstag.send(streamLytics, {
        event: 'page_view',
        page_title: pageTitle,
        page_location: pageUrl,
        page_type: eventType,
        base_url:
          window?.location?.protocol +
          '//' +
          window?.location?.hostname +
          window?.location?.pathname,
        page_full_url: window?.location?.href,
        page_template: datosPag?.route?.id,
        utm_source: dataSession?.session?.namespaces?.public?.utm_source?.value,
        utm_campaign:
          dataSession?.session?.namespaces?.public?.utm_campaign?.value,
        utm_medium: dataSession?.session?.namespaces?.public?.utm_medium?.value,
        utmi_cp: dataSession?.session?.namespaces?.public?.utmi_cp?.value,
        utmi_pc: dataSession?.session?.namespaces?.public?.utmi_pc?.value,
        utmi_p: dataSession?.session?.namespaces?.public?.utmi_p?.value,
      })

      const fullPath = location.pathname + location.search + location.hash

      let contentName = ''

      switch (true) {
        case /\/($|\?|#)/.test(fullPath):
          contentName = 'Home'
          break

        case /(_q|search-term)=\w+|map=.*?ft\b/.test(fullPath):
          contentName = 'Search'
          break

        case /\/p($|\?|#)/.test(fullPath):
          contentName = 'Product'
          break

        case /^\/login/.test(fullPath):
          contentName = 'Login'
          break

        case /^(\/_secure)?\/account/.test(fullPath):
          contentName = 'Account'
          break

        case /^\/[^\/]+\/?($|\?|#)/.test(fullPath):
          contentName = 'Department'
          break

        case /^(\/[^\/]+\/?){2,}($|\?|#)/.test(fullPath):
          contentName = 'Category'
          break

        default:
          break
      }

      if (contentName) {
        window.gtag('set', 'content_group', contentName)
      }

      break
    }

    case 'vtex:userData': {
      const { data } = e
      const ga4Vtex = localStorage.getItem('ga4Vtex')

      if (!data.isAuthenticated) {
        return
      }

      window.gtag('config', ga4Vtex, {
        user_id: data.id,
      })

      if (srcLytics && data) {
        window.jstag.send(streamLytics, {
          event: 'user_data',
          user_id: data.id,
          consent_mandatory: getCookie('OptanonConsent'),
          consent_analytics: getCookie('OptanonConsent'),
          consent_experience: getCookie('OptanonConsent'),
          consent_social_media: getCookie('OptanonConsent'),
          consent_targeting: getCookie('OptanonConsent'),
          opt_in: '',
          vtex_id:
            dataSession?.session?.namespaces?.authentication?.storeUserId
              ?.value,
          ga_id: getCookie('_ga'),
          // gclid: '',
          email: dataSession?.session?.namespaces?.profile?.email?.value,
          loginStatus:
            dataSession?.session?.namespaces?.authentication?.isAuthenticated
              ?.value,
        })
      }
      break
    }

    case 'vtex:newsletterSubscription': {
      if (e.data) {
        push('join_group', {
          group_id: 'newsletter',
        })

        window.jstag.send(streamLytics, {
          event: 'join_group',
          group_id: 'newsletter',
        })
      }

      break
    }

    case 'whirlpool:notifyMe': {
      if (e.data) {
        push('join_group', {
          group_id: 'product_unavailable',
          items: e.data.data,
        })
        
        window.jstag.send(streamLytics, {
          event: 'join_group',
          group_id: 'product_unavailable',
          items: e.data.data,
        })
      }

      break
    }

    case 'whirlpool:selectService': {
      if (e.data) {
        push('select_item', e.data.data)
      }

      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: 'select_item',
          ...e.data.data,
        })
      }
    }

    case 'whirlpool:viewServiceList': {
      if (e.data) {
        push('view_item_list', e.data.data)
      }

      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: 'view_item_list',
          ...e.data.data,
        })
      }

      break
    }

    case 'whirlpool:selectItem': {
      if (e.data) {
        push('select_item', e.data.data)
      }

      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: 'select_item',
          ...e.data.data,
        })
      }
      break
    }

    case 'whirlpool:viewListAccessories': {
      if (e.data) {
        push('view_item_list', e.data.data)
      }
      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: 'view_item_list',
          ...e.data.data,
        })
      }
      break
    }

    case 'whirlpool:addToCart': {
      if (e.data) {
        push('add_to_cart', e.data.data)
      }

      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: 'add_to_cart',
          ...e.data.data,
        })
      }

      break
    }

    case 'vtex:addToWishlist': {
      if (e.data) {
        const selectedItemInfo = e.data.items?.selectedItem
        const productItemInfo = e.data.items?.product

        if (!selectedItemInfo || !productItemInfo) return

        push('add_to_wishlist', {
          currency: e.data.currency,
          value: selectedItemInfo?.sellers[0]?.commertialOffer?.Price,
          items: [
            {
              itemId: selectedItemInfo?.itemId,
              item_name: productItemInfo?.productName,
              item_ref: productItemInfo?.productReference,
              affiliation: selectedItemInfo?.sellers[0]?.sellerName,
              currency: e.data.currency,
              discount:
                selectedItemInfo?.sellers[0]?.commertialOffer?.Price -
                selectedItemInfo?.sellers[0]?.commertialOffer
                  ?.PriceWithoutDiscount,
              item_brand: productItemInfo?.brand,
              item_category: productItemInfo?.categories,
              item_variant: selectedItemInfo?.nameComplete,
              item_variant_id: productItemInfo?.productId,
              item_variant_ref: productItemInfo?.productReference,
              item_availability:
                selectedItemInfo?.sellers[0]?.commertialOffer
                  ?.AvailableQuantity > 0
                  ? 'available'
                  : 'unavailable',
              price: selectedItemInfo?.sellers[0]?.commertialOffer?.Price,
              quantity: 1,
            },
          ],
        })

        if (srcLytics) {
          window.jstag.send(streamLytics, {
            event: 'add_to_wishlist',
            currency: e.data.currency,
            value: selectedItemInfo?.sellers[0]?.commertialOffer?.Price,
            items: [
              {
                itemId: selectedItemInfo?.itemId,
                item_name: productItemInfo?.productName,
                item_ref: productItemInfo?.productReference,
                affiliation: selectedItemInfo?.sellers[0]?.sellerName,
                currency: e.data.currency,
                discount:
                  selectedItemInfo?.sellers[0]?.commertialOffer?.Price -
                  selectedItemInfo?.sellers[0]?.commertialOffer
                    ?.PriceWithoutDiscount,
                item_brand: productItemInfo?.brand,
                item_category: productItemInfo?.categories,
                item_variant: selectedItemInfo?.nameComplete,
                item_variant_id: productItemInfo?.productId,
                item_variant_ref: productItemInfo?.productReference,
                item_availability:
                  selectedItemInfo?.sellers[0]?.commertialOffer
                    ?.AvailableQuantity > 0
                    ? 'available'
                    : 'unavailable',
                price: selectedItemInfo?.sellers[0]?.commertialOffer?.Price,
                quantity: 1,
              },
            ],
          })
        }
      }

      break
    }

    case 'whirlpool:flashSales': {
      const type =
        e.data.type === 'view' ? 'view_promotion' : 'select_promotion'

      if (e.data) {
        push(type, e.data.data)
      }
      if (srcLytics && e.data) {
        window.jstag.send(streamLytics, {
          event: type,
          ...e.data.data,
        })
      }

      break
    }

    default: {
      break
    }
  }
}
