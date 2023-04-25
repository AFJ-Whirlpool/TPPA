export function setSessionsStorageData(
  productId: string,
  listId: string,
  listName: string
) {
  const backupStorage = getSessionsStorageData()

  const filteredBackupStorage = backupStorage.filter(
    (item: { product_id: string }) => item.product_id !== productId
  )

  filteredBackupStorage.push({
    product_id: productId,
    item_list_id: listId,
    item_list_name: listName,
  })

  const sessionStorageListData = JSON.stringify(filteredBackupStorage)

  sessionStorage.setItem('item_list_id_name', sessionStorageListData)
}

export function getSessionsStorageData() {
  const sessionsData = sessionStorage.getItem('item_list_id_name') ?? '[]'

  if (!sessionsData) return

  const sessionsDataJson = JSON.parse(sessionsData)

  return sessionsDataJson
}
