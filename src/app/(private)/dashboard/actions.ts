"use server"

import { fetchDashboardStats, fetchKeyPartners, fetchLatestArticles } from "@/services/dashboard"

export async function getStats() {
  return fetchDashboardStats()
}

export async function getLatestArticles() {
  return fetchLatestArticles()
}

export async function getKeyPartners() {
  return fetchKeyPartners()
}
