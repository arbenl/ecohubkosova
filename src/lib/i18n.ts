import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => {
  // Validate and default to 'sq' if locale is invalid
  const validLocale = locale && ["sq", "en"].includes(locale) ? locale : "sq"

  // Load all translation files individually
  // This allows for better code splitting and maintainability
  const [
    navigation,
    cta,
    explore,
    about,
    contact,
    footer,
    home,
    dashboard,
    auth,
    sidebar,
    help,
    marketplace,
    listing,
    common,
    admin,
    errors,
    metadata,
  ] = await Promise.all([
    import(`../../messages/${validLocale}/navigation.json`),
    import(`../../messages/${validLocale}/cta.json`),
    import(`../../messages/${validLocale}/explore.json`),
    import(`../../messages/${validLocale}/about.json`),
    import(`../../messages/${validLocale}/contact.json`),
    import(`../../messages/${validLocale}/footer.json`),
    import(`../../messages/${validLocale}/home.json`),
    import(`../../messages/${validLocale}/dashboard.json`),
    import(`../../messages/${validLocale}/auth.json`),
    import(`../../messages/${validLocale}/sidebar.json`),
    import(`../../messages/${validLocale}/help.json`),
    import(`../../messages/${validLocale}/marketplace.json`),
    import(`../../messages/${validLocale}/listing.json`),
    import(`../../messages/${validLocale}/common.json`),
    import(`../../messages/${validLocale}/admin.json`),
    import(`../../messages/${validLocale}/errors.json`),
    import(`../../messages/${validLocale}/metadata.json`),
  ])

  return {
    locale: validLocale,
    messages: {
      navigation: navigation.default,
      cta: cta.default,
      explore: explore.default,
      about: about.default,
      contact: contact.default,
      footer: footer.default,
      home: home.default,
      dashboard: dashboard.default,
      auth: auth.default,
      sidebar: sidebar.default,
      help: help.default,
      marketplace: marketplace.default,
      listing: listing.default,
      common: common.default,
      admin: admin.default,
      errors: errors.default,
      metadata: metadata.default,
    },
  }
})
