import type { Component } from 'vue'
import { defineComponent, h, resolveComponent } from 'vue'

export function UseIcon(icon: string, color = 'inherit', size?: number | string): Component {
    return defineComponent({
        name: 'UseIcon',
        render() {
            return h(resolveComponent('n-icon'), {
                color,
                size: size || ''
            }, () => [
                h(resolveComponent(icon))
            ])
        }
    })
}
