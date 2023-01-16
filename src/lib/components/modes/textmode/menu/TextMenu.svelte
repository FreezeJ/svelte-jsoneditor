<svelte:options immutable={true} />

<script lang="ts">
  import {
    faFilter,
    faRedo,
    faSearch,
    faSortAmountDownAlt,
    faUndo
  } from '@fortawesome/free-solid-svg-icons'
  import { faJSONEditorCompact, faJSONEditorFormat } from '$lib/img/customFontawesomeIcons'
  import Menu from '../../../controls/Menu.svelte'
  import { noop } from 'lodash-es'
  import type { MenuItem } from '$lib'

  export let readOnly = false
  export let onFormat
  export let onCompact
  export let onSort
  export let onTransform
  export let onToggleSearch
  export let onUndo
  export let onRedo
  export let canUndo
  export let canRedo
  export let canFormat
  export let canCompact
  export let canSort
  export let canTransform
  export let onRenderMenu = noop

  let defaultItems: MenuItem[]
  $: defaultItems = !readOnly
    ? [
        {
          type: 'button',
          icon: faJSONEditorFormat,
          title: '格式化JSON：添加适当的缩进和新行 (Ctrl+I)',
          className: 'jse-format',
          onClick: onFormat,
          disabled: readOnly || !canFormat
        },
        {
          type: 'button',
          icon: faJSONEditorCompact,
          title: '压缩JSON：删除所有空格和换行 (Ctrl+Shift+I)',
          className: 'jse-compact',
          onClick: onCompact,
          disabled: readOnly || !canCompact
        },
        {
          type: 'separator'
        },
        {
          type: 'button',
          icon: faSortAmountDownAlt,
          title: '排序',
          className: 'jse-sort',
          onClick: onSort,
          disabled: readOnly || !canSort
        },
        {
          type: 'button',
          icon: faFilter,
          title: '转换内容 (过滤, 排序, 分类)',
          className: 'jse-transform',
          onClick: onTransform,
          disabled: readOnly || !canTransform
        },
        {
          type: 'button',
          icon: faSearch,
          title: '搜索 (Ctrl+F)',
          className: 'jse-search',
          onClick: onToggleSearch
        },
        {
          type: 'separator'
        },
        {
          type: 'button',
          icon: faUndo,
          title: '撤销 (Ctrl+Z)',
          className: 'jse-undo',
          onClick: onUndo,
          disabled: !canUndo
        },
        {
          type: 'button',
          icon: faRedo,
          title: '重做 (Ctrl+Shift+Z)',
          className: 'jse-redo',
          onClick: onRedo,
          disabled: !canRedo
        },
        {
          type: 'space'
        }
      ]
    : [
        {
          type: 'space'
        }
      ]

  $: items = onRenderMenu('text', defaultItems) || defaultItems
</script>

<Menu {items} />
