import { submitComplaint } from './client.js'
import { saveReportId } from './localReports.js'

const QUEUE_KEY = 'swachhlens_offline_queue'

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []
  } catch {
    return []
  }
}

export function addToOfflineQueue(item) {
  const queue = getOfflineQueue()
  const queuedItem = {
    ...item,
    id: `queued-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  }
  queue.push(queuedItem)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  return queuedItem
}

export function removeFromOfflineQueue(id) {
  const queue = getOfflineQueue().filter((item) => item.id !== id)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export async function flushOfflineQueue(onProgress) {
  const queue = getOfflineQueue()
  if (queue.length === 0) return []

  const successful = []
  for (const item of queue) {
    try {
      const complaint = await submitComplaint({
        photoUrl: item.photoUrl,
        latitude: item.latitude,
        longitude: item.longitude,
        comment: item.comment,
      })
      saveReportId(complaint.id)
      removeFromOfflineQueue(item.id)
      successful.push({ originalId: item.id, complaint })
      if (onProgress) onProgress(item.id, complaint)
    } catch (e) {
      console.warn('Failed to submit queued report:', item.id, e)
      // Keep in queue for next retry
    }
  }
  return successful
}
