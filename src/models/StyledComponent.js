import css from '../constructors/css'
import normalizeProps from '../utils/normalizeProps'

export default (ComponentStyle) => {
  const createStyledComponent = (target, rules, props) => {
    const componentStyle = new ComponentStyle(rules)

    // handle array-declaration props
    const currentProps = normalizeProps(props)
    const prevProps = normalizeProps(target.props)


    const StyledComponent = {
      inject: {
        $theme: {
          default: function () {
            return () => ({ })
          }
        }
      },
      props: {
        value: null,
        ...currentProps,
        ...prevProps
      },
      data () {
        return {
          localValue: this.value
        }
      },
      render (createElement) {
        const children = []
        for (const slot in this.$slots) {
          if (slot === 'default') {
            children.push(this.$slots[slot])
          } else {
            children.push(createElement('template', { slot }, this.$slots[slot]))
          }
        }

        return createElement(
          target,
          {
            class: [this.generatedClassName],
            props: {...this.$props, inputValue: this.$props.value},
            domProps: {
              value: this.localValue
            },
            on: {
              ...this.$listeners,
              input: event => {
                if (event && event.target) {
                  this.localValue = event.target.value
                }
              },
                change: event => {
                    this.localValue = event
                }
            },
            scopedSlots: this.$scopedSlots
          },
          children
        )
      },
      methods: {
        generateAndInjectStyles (componentProps) {
          return componentStyle.generateAndInjectStyles(componentProps)
        }
      },
      computed: {
        generatedClassName () {
          const componentProps = { theme: this.theme, ...this.$props }
          return this.generateAndInjectStyles(componentProps)
        },
        theme () {
          return this.$theme()
        }
      },
      watch: {
        value: {
          immediate: true,
          handler(newValue) {
          this.localValue = newValue

          }
        },
        localValue: {
          immediate: true,
          handler() {
          this.$emit('input', this.localValue)
        }
        }
      },
      extend (cssRules, ...interpolations) {
        const extendedRules = css(cssRules, ...interpolations)
        return createStyledComponent(target, rules.concat(extendedRules), props)
      },
      withComponent (newTarget) {
        return createStyledComponent(newTarget, rules, props)
      }
    }

    return StyledComponent
  }

  return createStyledComponent
}
