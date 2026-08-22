const STORAGE_KEY = 'swachhlens_my_reports'

export function saveReportId(id) {
  const ids = getReportIds()
  if (!ids.includes(id)) {
    ids.unshift(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }
}

export function getReportIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function syncValidReportIds(validIds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validIds))
  } catch {
    // ignore storage write errors
  }
}