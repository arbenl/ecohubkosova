export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Duke ngarkuar...</h2>
        <p className="text-gray-600">Ju lutemi prisni ndërsa verifikojmë sesionin tuaj.</p>
      </div>
    </div>
  )
}
