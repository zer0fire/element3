import { mount } from '@vue/test-utils'
import Progress from '../src/Progress.vue'
import {
  getColorsIndex,
  getRefValue,
  sortByPercentage,
  toPercentageColors,
  autoFixPercentage
} from '../src/Progress.vue'
import Color from '../../../../packages/color-picker/src/color'
import { isRef, toRefs, reactive } from 'vue'

describe('Progress.vue', () => {
  it('should create default Progress component and HTML structure', () => {
    const percentage = 55
    const wrapper = mount(Progress, {
      props: { percentage }
    })
    assertHasClass(wrapper, 'el-progress')
    assertHasClass(wrapper, 'el-progress--line')
    assertNotHasClass(wrapper, 'is-undefined')

    assertExistsElem(wrapper, '.el-progress > .el-progress-bar')
    assertExistsElem(wrapper, '.el-progress > .el-progress__text')
    assertExistsElem(wrapper, '.el-progress-bar > .el-progress-bar__outer')
    assertExistsElem(wrapper, '.el-progress-bar__outer .el-progress-bar__inner')

    assertSetPercentage(wrapper, percentage)

    expect(wrapper.find('.temptest').text()).toBe('')
  })

  describe('line type progress props:', () => {
    it('percentage', async () => {
      const percentage = 58
      const wrapper = mount(Progress, {
        props: { percentage }
      })
      assertSetPercentage(wrapper, 58)
      await wrapper.setProps({ percentage: 28 })
      assertSetPercentage(wrapper, 28)
    })

    it('fix percentage value', () => {
      expect(autoFixPercentage(-2)).toBe(0)
      expect(autoFixPercentage(129)).toBe(100)
      expect(autoFixPercentage(29)).toBe(29)
    })

    it('percentage validator', async () => {
      const percentage = 158
      const wrapper = mount(Progress, {
        props: { percentage }
      })
      assertSetPercentage(wrapper, 100)
      await wrapper.setProps({ percentage: -28 })
      assertSetPercentage(wrapper, 0)
    })

    it('format', () => {
      const format = (p) => (p === 100 ? '满' : `${p}%`)
      const percentage = 100
      const props = { percentage, format }
      const wrapper = mount(Progress, { props })
      assertContainText(wrapper, '.el-progress__text', '满')
    })

    it('color string', async () => {
      const color1 = '#409eff'
      const percentage = 30
      const props = { percentage, color: color1 }
      const wrapper = mount(Progress, { props })
      assertSetBgColor(wrapper, color1)
      const color2 = '#336699'
      await wrapper.setProps({ color: color2 })
      assertSetBgColor(wrapper, color2)
      const color3 = ''
      await wrapper.setProps({ color: color3 })
      assertNotContainStyle(
        wrapper,
        '.el-progress-bar__inner',
        'background-color'
      )
    })

    it('color function', async () => {
      const color = (percentage) => {
        if (percentage < 30) {
          return '#33ff99'
        } else if (percentage < 70) {
          return '#ff9900'
        } else {
          return '#993300'
        }
      }
      const p1 = 20
      const props = { percentage: p1, color }
      const wrapper = mount(Progress, { props })

      assertSetBgColor(wrapper, color(p1))

      const p2 = 50
      await wrapper.setProps({ percentage: p2 })

      assertSetBgColor(wrapper, color(p2))

      const p3 = 80
      await wrapper.setProps({ percentage: p3 })

      assertSetBgColor(wrapper, color(p3))
    })

    it('get index of percentage in array', () => {
      const colors = [
        { color: '#1989fa', percentage: 80 },
        { color: '#f56c6c', percentage: 20 },
        { color: '#6f7ad3', percentage: 100 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#e6a23c', percentage: 40 }
      ]
      colors.sort(sortByPercentage)
      expect(getColorsIndex(colors, 0)).toBe(0)
      expect(getColorsIndex(colors, 12)).toBe(0)
      expect(getColorsIndex(colors, 20)).toBe(1)
      expect(getColorsIndex(colors, 32)).toBe(1)
      expect(getColorsIndex(colors, 42)).toBe(2)
      expect(getColorsIndex(colors, 62)).toBe(3)
      expect(getColorsIndex(colors, 82)).toBe(4)
      expect(getColorsIndex(colors, 100)).toBe(4)
    })

    it('should get ref value correct', () => {
      expect(isRef(undefined)).toBeFalsy()
      expect(isRef(null)).toBeFalsy()
      expect(isRef(0)).toBeFalsy()
      expect(isRef('')).toBeFalsy()
      expect(isRef(false)).toBeFalsy()
      expect(isRef(true)).toBeFalsy()
      const props = reactive({
        percentage: 0,
        color: ['#336699', '#339966', '#996633']
      })
      const { percentage, color } = toRefs(props)
      const pv = getRefValue(percentage)
      expect(pv).toBe(props.percentage)
      const cv = color.value
      expect(cv).toEqual(props.color)
    })

    it('should map to percentage colors correct', () => {
      const colors = ['#336699', '#339966', '#996633', '#663399']
      const rs = toPercentageColors(colors)
      expect(rs.length).toBe(4)
      expect(rs[0].color).toBe(colors[0])
      expect(rs[0].percentage).toBe(25)
      expect(rs[1].percentage).toBe(50)
      expect(rs[2].percentage).toBe(75)
      expect(rs[3].percentage).toBe(100)

      const colorObjs = [
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 }
      ]
      const objs = toPercentageColors(colorObjs)
      expect(objs.length).toBe(5)
      expect(objs[0].color).toBe(colorObjs[0].color)
      expect(objs[0].percentage).toBe(80)
      expect(objs[1].percentage).toBe(100)
      expect(objs[2].percentage).toBe(60)
      expect(objs[3].percentage).toBe(20)
      expect(objs[4].percentage).toBe(40)
    })

    it('color string array', async () => {
      const colors = ['#336699', '#339966', '#996633']
      const percentage = 15
      const props = { percentage, color: colors }
      const wrapper = mount(Progress, { props })
      assertSetBgColor(wrapper, colors[0])

      await wrapper.setProps({ percentage: 0 })
      assertSetBgColor(wrapper, colors[0])
      await wrapper.setProps({ percentage: 10 })
      assertSetBgColor(wrapper, colors[0])
      await wrapper.setProps({ percentage: 35 })
      assertSetBgColor(wrapper, colors[1])
      await wrapper.setProps({ percentage: 65 })
      assertSetBgColor(wrapper, colors[1])
      await wrapper.setProps({ percentage: 67 })
      assertSetBgColor(wrapper, colors[2])
      await wrapper.setProps({ percentage: 100 })
      assertSetBgColor(wrapper, colors[2])
    })

    it('color object array', () => {
      const colors = [
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 }
      ]
      colors.sort(sortByPercentage)
      expect(colors[0].percentage).toBe(20)
      expect(colors[3].percentage).toBe(80)
      expect(colors[4].percentage).toBe(100)
      const percentage = 85
      const props = { percentage, color: colors }
      const wrapper = mount(Progress, { props })
      expect(wrapper).toBeDefined()
      assertSetBgColor(wrapper, colors[4].color)
    })

    it('status add "is-xxx" class', async () => {
      const percentage = 85
      const status = 'success'
      const props = { percentage, status }
      const wrapper = mount(Progress, { props })
      assertHasClass(wrapper, 'is-success')
      await wrapper.setProps({ status: 'exception' })
      assertHasClass(wrapper, 'is-exception')
      await wrapper.setProps({ status: 'warning' })
      assertHasClass(wrapper, 'is-warning')

      await wrapper.setProps({ status: 'error' })
      assertNotHasClass(wrapper, 'is-error')
    })
  })
})

function assertSetBgColor(wrapper, color) {
  const rgb = fromHexToRgb(color)
  assertContainStyle(
    wrapper,
    '.el-progress-bar__inner',
    `background-color: ${rgb};`
  )
}

function fromHexToRgb(hex) {
  const c = new Color()
  c.fromString(hex)
  const rgb = c.toRgb()
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

function assertSetPercentage(wrapper, percentage) {
  assertContainText(wrapper, '.el-progress__text', `${percentage}%`)
  assertContainStyle(
    wrapper,
    '.el-progress-bar__inner',
    `width: ${percentage}%;`
  )
}

function assertContainStyle(wrapper, selector, strStyle) {
  const elem = wrapper.find(selector)
  expect(elem.attributes().style).toBeDefined()
  expect(elem.attributes().style).toContain(strStyle)
}

function assertNotContainStyle(wrapper, selector, strStyle) {
  const elem = wrapper.find(selector)
  expect(elem.attributes().style).not.toContain(strStyle)
}

function assertContainText(wrapper, selector, text) {
  expect(wrapper.find(selector).text()).toContain(text)
}

function assertHasClass(elem, className) {
  expect(elem.classes().includes(className)).toBeTruthy()
}

function assertNotHasClass(elem, className) {
  expect(elem.classes().includes(className)).toBeFalsy()
}

function assertExistsElem(wrapper, selector) {
  expect(wrapper.find(selector).exists()).toBeTruthy()
}