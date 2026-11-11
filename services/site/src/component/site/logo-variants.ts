import logoTransparentLight from "../../asset/brand/warcode-logo-transparent-light.svg?no-inline"
import logoTransparentDark from "../../asset/brand/warcode-logo-transparent-dark.svg?no-inline"
import logoSolidLight from "../../asset/brand/warcode-logo-solid-light.svg?no-inline"
import logoSolidDark from "../../asset/brand/warcode-logo-solid-dark.svg?no-inline"
import wordmarkTransparentLight from "../../asset/brand/warcode-wordmark-transparent-light.svg?no-inline"
import wordmarkTransparentDark from "../../asset/brand/warcode-wordmark-transparent-dark.svg?no-inline"
import wordmarkSolidLight from "../../asset/brand/warcode-wordmark-solid-light.svg?no-inline"
import wordmarkSolidDark from "../../asset/brand/warcode-wordmark-solid-dark.svg?no-inline"

/**
 * The extra logo files for the logo menus, by style, logo or wordmark, and tone. "transparent" lets the
 * background show through the inner shadow; "solid" is one colour with the shadow filled in.
 */
export const logoVariantSvgs = {
  transparent: {
    logo: { light: logoTransparentLight, dark: logoTransparentDark },
    wordmark: { light: wordmarkTransparentLight, dark: wordmarkTransparentDark },
  },
  solid: {
    logo: { light: logoSolidLight, dark: logoSolidDark },
    wordmark: { light: wordmarkSolidLight, dark: wordmarkSolidDark },
  },
}
