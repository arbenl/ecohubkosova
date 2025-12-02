import navigation from "../../messages/en/navigation.json"
import cta from "../../messages/en/cta.json"

import about from "../../messages/en/about.json"
import contact from "../../messages/en/contact.json"
import footer from "../../messages/en/footer.json"
import home from "../../messages/en/home.json"
import dashboard from "../../messages/en/dashboard.json"
import auth from "../../messages/en/auth.json"
import sidebar from "../../messages/en/sidebar.json"
import help from "../../messages/en/help.json"
import marketplace from "../../messages/en/marketplace.json"
import listing from "../../messages/en/listing.json"
import common from "../../messages/en/common.json"
import admin from "../../messages/en/admin.json"
import errors from "../../messages/en/errors.json"
import metadata from "../../messages/en/metadata.json"

type Messages = {
  navigation: typeof navigation
  cta: typeof cta

  about: typeof about
  contact: typeof contact
  footer: typeof footer
  home: typeof home
  dashboard: typeof dashboard
  auth: typeof auth
  sidebar: typeof sidebar
  help: typeof help
  marketplace: typeof marketplace
  listing: typeof listing
  common: typeof common
  admin: typeof admin
  errors: typeof errors
  metadata: typeof metadata
}

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
