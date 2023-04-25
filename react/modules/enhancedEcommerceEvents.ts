import push from './push'
import {
  PixelMessage,
  AddToCartData,
  RemoveToCartData,
  ProductViewData,
  Seller,
  ProductClickData,
  ProductViewReferenceId,
  ProductImpressionData,
  PromotionClickData,
  PromoViewData,
  OrderPlacedData,
  SearchPageInfoData,
} from '../typings/events'
import { IConfigPricesAndDiscount } from '../typings/functions'
import { GTAGData, GTAGDataItem } from '../typings/gtm'
import {
  getSessionsStorageData,
  setSessionsStorageData,
} from '../utils/itemListSession'

function getSeller(sellers: Seller[]) {
  const defaultSeller = sellers.find((seller) => seller.sellerDefault)

  if (!defaultSeller) {
    return sellers[0]
  }

  return defaultSeller
}

const defaultReference = { Value: '' }

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
  const srcLytics = localStorage.getItem('srcLytics')
  const streamLytics = localStorage.getItem('streamLytics')
  switch (e.data.eventName) {
    case 'vtex:productView': {
      const {
        currency,
        product: {
          productId,
          productReference,
          selectedSku,
          productName,
          brand,
          categoryTree,
        },
      } = e.data as ProductViewData

      const productAvailableQuantity = getSeller(selectedSku.sellers)
        .commertialOffer.AvailableQuantity

      const isAvailable =
        productAvailableQuantity > 0 ? 'available' : 'unavailable'

      const skuReferenceId = (
        (selectedSku.referenceId as unknown as ProductViewReferenceId)?.[0] ??
        defaultReference
      ).Value

      const config: IConfigPricesAndDiscount = {
        price: undefined,
        fullPrice: undefined,
        discount: 0,
      }

      try {
        config.price = getSeller(selectedSku.sellers).commertialOffer.Price
      } catch {
        config.price = undefined
      }

      try {
        config.fullPrice = getSeller(
          selectedSku.sellers
        ).commertialOffer.ListPrice
      } catch {
        config.fullPrice = undefined
      }

      if (config.price && config.fullPrice) {
        config.discount = config.fullPrice - config.price
      }

      const { price, discount } = config

      const categoryObj: Record<string, string> = {}

      for (const index in categoryTree) {
        const item = categoryTree[index]
        const numIndex = +index

        if (numIndex > 0) {
          categoryObj[`item_category${numIndex + 1}`] = item.name
        } else {
          categoryObj.item_category = item.name
        }
      }

      const { list } = e.data

      const listId = list
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')

      const gtagData = {
        currency,
        value: price,
        // item_list_id: listId,
        // item_list_name: list,
        items: [
          {
            item_id: productId,
            item_name: productName,
            item_list_id: listId,
            item_list_name: list,
            ...(productReference ? { item_ref: productReference } : {}),
            affiliation: getSeller(selectedSku.sellers).sellerName ?? '',
            currency,
            discount: +discount.toFixed(2),
            item_brand: brand,
            ...categoryObj,
            item_variant: selectedSku.name,
            item_variant_id: selectedSku.itemId,
            ...(selectedSku.ean ? { item_variant_ean: selectedSku.ean } : {}),
            ...(selectedSku.ean ? { item_variant_ean: selectedSku.ean } : {}),
            ...(skuReferenceId ? { item_variant_ref: skuReferenceId } : {}),
            item_availability: isAvailable,
            price,
            quantity: 1,
          },
        ],
      }

      push('view_item', gtagData)

      if (srcLytics) {
        window.jstag.send(streamLytics, {
          event: 'view_item',
          ...gtagData,
        })
      }

      return
    }

    case 'vtex:productClick': {
      const {
        position,
        currency,
        product: {
          productId,
          productName,
          productReference,
          sku,
          brand,
          categories,
        },
      } = e.data as ProductClickData

      const { ListPrice, Price } = getSeller(sku.sellers).commertialOffer
      const discount = ListPrice - Price

      const allCategories = categories?.[0] ?? ''
      const categoriesArr = allCategories.split('/').filter((i) => i)

      const categoryObj: Record<string, string> = {}

      for (const index in categoriesArr) {
        const item = categoriesArr[index]
        const numIndex = +index

        if (numIndex > 0) {
          categoryObj[`item_category${numIndex + 1}`] = item
        } else {
          categoryObj.item_category = item
        }
      }

      const isAvailable =
        getSeller(sku.sellers).commertialOffer.AvailableQuantity > 0

      const skuEAN = sku.ean

      const { list } = e.data

      const listId = list
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')

      const gtagData: GTAGData = {
        item_list_id: listId,
        item_list_name: list,
        items: [
          {
            item_id: productId,
            item_availability: isAvailable ? 'available' : 'unavailable',
            item_name: productName,
            ...(productReference ? { item_ref: productReference } : {}),
            affiliation: getSeller(sku.sellers).sellerName ?? '',
            currency,
            discount: +discount.toFixed(2),
            item_brand: brand,
            ...categoryObj,
            price: Price,
            quantity: 1,
            index: position - 1,
            ...(skuEAN && { item_variant_ean: skuEAN }),
            item_variant_id: sku.itemId,
            item_variant_ref: sku.referenceId.Value,
          },
        ],
      }

      push('select_item', gtagData)

      if (srcLytics) {
        window.jstag.send(streamLytics, {
          event: 'select_item',
          ...gtagData,
        })
      }

      return
    }

    case 'vtex:pageInfo': {
      const { eventType } = e.data

      switch (eventType) {
        case 'internalSiteSearchView': {
          const data = e.data as SearchPageInfoData

          push('search', {
            ...(data.search?.term ? { search_term: data.search?.term } : {}),
          })

          break
        }

        default: {
          break
        }
      }

      break
    }

    case 'vtex:addToCart': {
      const { items, currency } = e.data as AddToCartData

      const gtagItems: Array<Partial<GTAGDataItem>> = []
      let value = 0

      for (const index in items) {
        const {
          sellingPrice,
          price,
          productId,
          brand,
          category,
          name,
          variant,
          productRefId,
          referenceId,
          priceIsInt,
          sellerName,
          skuId,
          ean,
          quantity,
        } = items[index]

        const numberDivision = priceIsInt ? 100 : 1

        value += sellingPrice / numberDivision
        const discount = price / numberDivision - sellingPrice / numberDivision

        const categoriesArr = category.split('/').filter((i) => i)

        const categoryObj: Record<string, string> = {}

        for (const index in categoriesArr) {
          const item = categoriesArr[index]
          const numIndex = +index

          if (numIndex > 0) {
            categoryObj[`item_category${numIndex + 1}`] = item
          } else {
            categoryObj.item_category = item
          }
        }

        const discountFormat = +discount.toFixed(2)

        const sessionsStorageData = getSessionsStorageData()
        const currentProduct = sessionsStorageData.filter(
          (item: { product_id: string }) => item.product_id !== productId
        )

        gtagItems.push({
          item_id: productId,
          item_name: name,
          item_list_id: currentProduct[currentProduct.length - 1].item_list_id,
          item_list_name:
            currentProduct[currentProduct.length - 1].item_list_name,
          ...(productRefId ? { item_ref: productRefId } : {}),
          affiliation: sellerName,
          currency,
          ...(discountFormat > 0 && { discount: discountFormat }),
          ...(brand && { item_brand: brand }),
          ...categoryObj,
          price: sellingPrice / numberDivision,
          item_variant: variant,
          item_variant_id: skuId,
          ...(ean ? { item_variant_ean: ean } : {}),
          ...(referenceId ? { item_variant_ref: referenceId } : {}),
          quantity,
          index: +index,
        })
      }

      const gtagData: GTAGData = {
        value,
        currency,
        items: gtagItems,
      }

      push('add_to_cart', gtagData)

      if (srcLytics) {
        window.jstag.send(streamLytics, {
          event: 'add_to_cart',
          ...gtagData,
        })
      }

      return
    }

    case 'vtex:removeFromCart': {
      const { currency, items } = e.data as RemoveToCartData

      const gtagItems: Array<Partial<GTAGDataItem>> = []
      let value = 0

      for (const index in items) {
        const {
          price,
          productId,
          brand,
          category,
          name,
          variant,
          productRefId,
          referenceId,
          priceIsInt,
          sellerName,
          skuId,
          ean,
          quantity,
        } = items[index]

        const numberDivision = priceIsInt ? 100 : 1

        value += price / numberDivision

        const categoriesArr = category.split('/').filter((i) => i)

        const categoryObj: Record<string, string> = {}

        for (const index in categoriesArr) {
          const item = categoriesArr[index]
          const numIndex = +index

          if (numIndex > 0) {
            categoryObj[`item_category${numIndex + 1}`] = item
          } else {
            categoryObj.item_category = item
          }
        }

        const sessionsStorageData = getSessionsStorageData()
        const currentProduct = sessionsStorageData.filter(
          (item: { product_id: string }) => item.product_id !== productId
        )

        gtagItems.push({
          item_id: productId,
          item_name: name,
          item_list_id: currentProduct[currentProduct.length - 1].item_list_id,
          item_list_name:
            currentProduct[currentProduct.length - 1].item_list_name,
          ...(productRefId ? { item_ref: productRefId } : {}),
          ...(sellerName ? { affiliation: sellerName } : {}),
          currency,
          item_brand: brand,
          ...categoryObj,
          price: price / numberDivision,
          item_variant: variant,
          item_variant_id: skuId,
          ...(ean ? { item_variant_ean: ean } : {}),
          ...(referenceId ? { item_variant_ref: referenceId } : {}),
          quantity,
          index: +index,
        })
      }

      const gtagData: GTAGData = {
        currency,
        value,
        items: gtagItems,
      }

      push('remove_from_cart', gtagData)

      if (srcLytics) {
        window.jstag.send(streamLytics, {
          event: 'remove_from_cart',
          ...gtagData,
        })
      }

      return
    }

    case 'vtex:orderPlaced': {
      const {
        transactionProducts,
        currency,
        transactionTotal,
        transactionAffiliation,
        transactionId,
        transactionPaymentType,
        transactionShippingMethod,
        transactionShipping,
        transactionTax,
      } = e.data as OrderPlacedData

      let { coupon } = e.data as OrderPlacedData

      if (coupon) {
        coupon = coupon.toUpperCase()
      }

      const gtagItems: Array<Partial<GTAGDataItem>> = []

      for (const index in transactionProducts) {
        const {
          id,
          productRefId,
          name,
          brand,
          skuName,
          categoryTree,
          seller,
          sku,
          skuRefId,
          quantity,
          ean,
          originalPrice,
          sellingPrice,
        } = transactionProducts[index]

        const categoryObj: Record<string, string> = {}

        for (const categoryIndex in categoryTree) {
          const item = categoryTree[categoryIndex]

          if (+categoryIndex > 0) {
            categoryObj[`item_category${+categoryIndex + 1}`] = item
          } else {
            categoryObj.item_category = item
          }
        }

        const sessionsStorageData = getSessionsStorageData()
        const currentProduct = sessionsStorageData.filter(
          (item: { product_id: string }) => item.product_id !== id
        )

        gtagItems.push({
          item_id: id,
          item_name: name.replace(` ${skuName}`, ''),
          item_list_id: currentProduct[currentProduct.length - 1].item_list_id,
          item_list_name:
            currentProduct[currentProduct.length - 1].item_list_name,
          discount: +(originalPrice - sellingPrice).toFixed(2),
          ...(productRefId ? { item_ref: productRefId } : {}),
          ...(seller ? { affiliation: seller } : {}),
          currency,
          item_brand: brand,
          ...categoryObj,
          price: sellingPrice,
          item_variant: skuName,
          item_variant_id: sku,
          ...(ean ? { item_variant_ean: ean } : {}),
          ...(skuRefId ? { item_variant_ref: skuRefId } : {}),
          quantity,
          index: +index,
        })
      }

      const gtagData: GTAGData = {
        items: gtagItems,
        transaction_id: transactionId,
        affiliation: transactionAffiliation,
        value: transactionTotal,
        payment_type: transactionPaymentType
          .map((type) => type.paymentSystemName)
          .join(', '),
        shipping_tier: transactionShippingMethod
          .map((type) => type.selectedSla)
          .join(', '),
        tax: transactionTax,
        shipping: transactionShipping,
        currency,
        ...(coupon && { coupon }),
      }

      push('purchase', gtagData)

      return
    }

    case 'vtex:productImpression': {
      const { currency, impressions } = e.data as ProductImpressionData

      const gtagItems: Array<Partial<GTAGDataItem>> = []

      for (const impression of impressions) {
        const {
          product: {
            sku,
            productId,
            productName,
            productReference,
            brand,
            categories,
          },
          position,
        } = impression

        const { ListPrice, Price } = getSeller(sku.sellers).commertialOffer
        const discount = ListPrice - Price

        const firstCategory = categories[0] ?? ''
        const categoriesArr = firstCategory.split('/').filter((i) => i)

        const categoryObj: Record<string, string> = {}

        for (const index in categoriesArr) {
          const item = categoriesArr[index]
          const numIndex = +index

          if (numIndex > 0) {
            categoryObj[`item_category${numIndex + 1}`] = item
          } else {
            categoryObj.item_category = item
          }
        }

        const isAvailable =
          getSeller(sku.sellers).commertialOffer.AvailableQuantity > 0

        const skuEAN = sku.ean

        gtagItems.push({
          item_id: productId,
          item_name: productName,
          item_availability: isAvailable ? 'available' : 'unavailable',
          item_ref: productReference ?? null,
          affiliation: getSeller(sku.sellers).sellerName ?? '',
          currency,
          ...categoryObj,
          discount: +discount.toFixed(2),
          item_brand: brand,
          price: Price,
          quantity: 1,
          index: position - 1,
          ...(skuEAN && { item_variant_ean: skuEAN }),
          item_variant_id: sku.itemId,
          item_variant_ref: sku.referenceId.Value,
        })
      }

      const list = e.data.list

      const listId = list
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')

      const gtagData: GTAGData = {
        item_list_id: listId,
        item_list_name: list,
        items: gtagItems,
      }

      if (location.search.match(/_q=\w+|map=.*?ft\b/)) {
        gtagData.item_list_id = 'search'
        gtagData.item_list_name = 'Search'
      }

      if (location.pathname == '/') {
        gtagData.item_list_id = listId
        gtagData.item_list_name = list
      }

      const proudctId = e.data.impressions[0].product.productId

      setSessionsStorageData(proudctId, listId, list)

      push('view_item_list', gtagData)

      if (srcLytics) {
        window.jstag.send(streamLytics, {
          event: 'view_item_list',
          ...gtagData,
        })
      }

      return
    }

    case 'vtex:promoView': {
      const { promotions } = e.data as PromoViewData

      const items: Array<Partial<GTAGDataItem>> = []

      for (const index in promotions) {
        const promotion = promotions[index]

        items.push({
          item_id: promotion.id,
          item_name: promotion.name,
          creative_name: promotion.creative,
          ...(promotion.position && { index: +promotion.position }),
          creative_slot: promotion.position,
        })
      }

      const gtagData: GTAGData = { items }

      push('view_promotion', gtagData)

      break
    }

    case 'vtex:promotionClick': {
      const { promotions } = e.data as PromotionClickData

      const items: Array<Partial<GTAGDataItem>> = []

      for (const index in promotions) {
        const promotion = promotions[index]

        items.push({
          item_id: promotion.id,
          item_name: promotion.name,
          creative_name: promotion.creative,
          ...(promotion.position && { index: +promotion.position }),
          creative_slot: promotion.position,
        })
      }

      const gtagData: GTAGData = { items }

      push('select_promotion', gtagData)

      break
    }

    default: {
      break
    }
  }
}
