/*
 * Generated design tokens for Chakra UI based on Smetapro design system.
 * Import this file and pass `smetaproTheme` into `extendTheme`.
 */
import { ThemeOverride } from "@chakra-ui/react";

export const colors: ThemeOverride["colors"] = {
  primary: {
    50: "#EEF4FF",
    100: "#DCE6FF",
    200: "#B9CDFF",
    300: "#8CAEFF",
    400: "#5F8FFF",
    500: "#3466D1",
    600: "#264EA4",
    700: "#1A3877",
    800: "#10224A",
    900: "#081327"
  },
  secondary: {
    50: "#E9FCF9",
    100: "#C9F7EE",
    200: "#93ECD9",
    300: "#5ADABE",
    400: "#2FC2A6",
    500: "#14A68D",
    600: "#0E8573",
    700: "#0A6658",
    800: "#06483D",
    900: "#032E28"
  },
  accent: {
    50: "#FFF4E8",
    100: "#FFE3C2",
    200: "#FFC088",
    300: "#FF9D4F",
    400: "#FF7F1F",
    500: "#E96500",
    600: "#C15000",
    700: "#8F3A00",
    800: "#5D2400",
    900: "#2E1100"
  },
  neutral: {
    0: "#FFFFFF",
    50: "#F7F9FC",
    100: "#EDF1F7",
    200: "#D8DFEB",
    300: "#C2CAD8",
    400: "#9BA7BB",
    500: "#6B778C",
    600: "#4C5668",
    700: "#363D4A",
    800: "#20242D",
    900: "#0F1218"
  },
  success: {
    100: "#E3FCEC",
    500: "#3BB273",
    700: "#277A4C"
  },
  warning: {
    100: "#FFF8E6",
    500: "#E8A538",
    700: "#976A12"
  },
  danger: {
    100: "#FFE8E6",
    500: "#E24C4C",
    700: "#9A2D2D"
  },
  info: {
    100: "#E6F4FF",
    500: "#3894E8",
    700: "#1D5C99"
  }
};

export const fonts: ThemeOverride["fonts"] = {
  heading: "Manrope, sans-serif",
  body: "Inter, sans-serif",
  mono: "Roboto Mono, monospace"
};

export const fontSizes: ThemeOverride["fontSizes"] = {
  h1: "48px",
  h2: "32px",
  h3: "24px",
  body: "16px",
  caption: "14px",
  micro: "12px"
};

export const lineHeights: ThemeOverride["lineHeights"] = {
  h1: "56px",
  h2: "40px",
  h3: "32px",
  body: "24px",
  caption: "20px",
  micro: "16px"
};

export const radii: ThemeOverride["radii"] = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "20px",
  full: "9999px"
};

export const shadows: ThemeOverride["shadows"] = {
  xs: "0px 1px 2px rgba(15, 18, 24, 0.12)",
  sm: "0px 2px 6px rgba(15, 18, 24, 0.14)",
  md: "0px 10px 30px rgba(15, 18, 24, 0.16)",
  lg: "0px 24px 48px rgba(15, 18, 24, 0.18)"
};

export const space: ThemeOverride["space"] = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px"
};

export const sizes: ThemeOverride["sizes"] = {
  container: {
    sm: "600px",
    md: "1024px",
    lg: "1200px",
    xl: "1440px"
  }
};

export const semanticTokens: ThemeOverride["semanticTokens"] = {
  colors: {
    "text.primary": "neutral.800",
    "text.muted": "neutral.500",
    "bg.canvas": "neutral.0",
    "bg.subtle": "neutral.50",
    "border.default": "neutral.200",
    "focus.ring": "#0F8CE9",
    "status.success": "success.500",
    "status.warning": "warning.500",
    "status.danger": "danger.500",
    "status.info": "info.500"
  },
  radii: {
    button: "md",
    card: "lg",
    modal: "xl"
  },
  shadows: {
    raised: "md",
    overlay: "lg"
  }
};

export const transition: ThemeOverride["transition"] = {
  duration: {
    fast: "120ms",
    normal: "180ms",
    slow: "240ms"
  },
  easing: {
    enter: "cubic-bezier(0.33, 1, 0.68, 1)",
    exit: "cubic-bezier(0.65, 0, 0.35, 1)",
    linear: "linear"
  }
};

export const smetaproTheme: ThemeOverride = {
  colors,
  fonts,
  fontSizes,
  lineHeights,
  radii,
  shadows,
  space,
  sizes,
  semanticTokens,
  transition,
  styles: {
    global: {
      body: {
        color: "neutral.700",
        bg: "neutral.0"
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "md",
        _focusVisible: {
          boxShadow: "0 0 0 2px #0F8CE9"
        }
      },
      sizes: {
        lg: {
          h: "48px",
          px: "24px",
          fontSize: "body"
        },
        md: {
          h: "40px",
          px: "20px",
          fontSize: "body"
        },
        sm: {
          h: "32px",
          px: "16px",
          fontSize: "caption"
        }
      },
      variants: {
        solid: {
          bg: "primary.500",
          color: "neutral.0",
          _hover: { bg: "primary.600" },
          _active: { bg: "primary.700" },
          _disabled: { bg: "primary.200", opacity: 1, color: "neutral.400" }
        },
        outline: {
          borderWidth: "1px",
          borderColor: "primary.500",
          color: "primary.500",
          _hover: { bg: "primary.50" },
          _active: { bg: "primary.100" },
          _disabled: { borderColor: "neutral.200", color: "neutral.300" }
        },
        ghost: {
          color: "primary.600",
          _hover: { bg: "neutral.50" },
          _active: { bg: "neutral.100" },
          _disabled: { color: "neutral.300" }
        }
      }
    }
  }
};

export default smetaproTheme;
