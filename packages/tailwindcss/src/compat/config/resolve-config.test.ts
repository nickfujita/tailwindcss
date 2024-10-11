import { expect, test } from 'vitest'
import { buildDesignSystem } from '../../design-system'
import { Theme } from '../../theme'
import { resolveConfig } from './resolve-config'

test('top level theme keys are replaced', () => {
  let design = buildDesignSystem(new Theme())

  let config = resolveConfig(design, [
    {
      config: {
        theme: {
          colors: {
            red: 'red',
          },

          fontFamily: {
            sans: 'SF Pro Display',
          },
        },
      },
      base: '/root',
    },
    {
      config: {
        theme: {
          colors: {
            green: 'green',
          },
        },
      },
      base: '/root',
    },
    {
      config: {
        theme: {
          colors: {
            blue: 'blue',
          },
        },
      },
      base: '/root',
    },
  ])

  expect(config).toMatchObject({
    theme: {
      colors: {
        blue: 'blue',
      },
      fontFamily: {
        sans: 'SF Pro Display',
      },
    },
  })
})

test('theme can be extended', () => {
  let design = buildDesignSystem(new Theme())

  let config = resolveConfig(design, [
    {
      config: {
        theme: {
          colors: {
            red: 'red',
          },

          fontFamily: {
            sans: 'SF Pro Display',
          },
        },
      },
      base: '/root',
    },
    {
      config: {
        theme: {
          extend: {
            colors: {
              blue: 'blue',
            },
          },
        },
      },
      base: '/root',
    },
  ])

  expect(config).toMatchObject({
    theme: {
      colors: {
        red: 'red',
        blue: 'blue',
      },
      fontFamily: {
        sans: 'SF Pro Display',
      },
    },
  })
})

test('theme keys can reference other theme keys using the theme function regardless of order', ({
  expect,
}) => {
  let design = buildDesignSystem(new Theme())

  let config = resolveConfig(design, [
    {
      config: {
        theme: {
          colors: {
            red: 'red',
          },
          placeholderColor: {
            green: 'green',
          },
        },
      },
      base: '/root',
    },
    {
      config: {
        theme: {
          extend: {
            colors: ({ theme }) => ({
              ...theme('placeholderColor'),
              blue: 'blue',
            }),
          },
        },
      },
      base: '/root',
    },
    {
      config: {
        theme: {
          extend: {
            caretColor: ({ theme }) => theme('accentColor'),
            accentColor: ({ theme }) => theme('backgroundColor'),
            backgroundColor: ({ theme }) => theme('colors'),
          },
        },
      },
      base: '/root',
    },
  ])

  expect(config).toMatchObject({
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      accentColor: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      backgroundColor: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      caretColor: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
  })
})

test('theme keys can read from the CSS theme', () => {
  let theme = new Theme()
  theme.add('--color-green', 'green')

  let design = buildDesignSystem(theme)

  let config = resolveConfig(design, [
    {
      config: {
        theme: {
          colors: ({ theme }) => ({
            // Reads from the --color-* namespace
            ...theme('color'),
            red: 'red',
          }),
          accentColor: ({ theme }) => ({
            // Reads from the --color-* namespace through `colors`
            ...theme('colors'),
          }),
          placeholderColor: ({ theme }) => ({
            // Reads from the --color-* namespace through `colors`
            primary: theme('colors.green'),

            // Reads from the --color-* namespace directly
            secondary: theme('color.green'),
          }),
        },
      },
      base: '/root',
    },
  ])

  expect(config).toMatchObject({
    theme: {
      colors: {
        red: 'red',
        green: 'green',
      },
      accentColor: {
        red: 'red',
        green: 'green',
      },
      placeholderColor: {
        primary: 'green',
        secondary: 'green',
      },
    },
  })
})