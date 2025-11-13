"use server"

import { fetchDashboardStats, fetchKeyPartners, fetchLatestArticles } from "@/src/services/dashboard"

export async function getStats() {
  return fetchDashboardStats()
}

export async function getLatestArticles() {
  return fetchLatestArticles()
}

export async function getKeyPartners() {
  return fetchKeyPartners()
}
