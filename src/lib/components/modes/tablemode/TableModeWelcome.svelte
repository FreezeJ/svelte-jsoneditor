<script lang="ts">
  import type { JSONValue } from 'lossless-json'
  import type { JSONParser, OnChangeMode } from '$lib/types'
  import { Mode } from '$lib/types'
  import { valueType } from '$lib/utils/typeUtils'
  import { findNestedArrays } from '$lib/logic/table'
  import type { JSONPath } from 'immutable-json-patch'
  import { getIn, isJSONArray, isJSONObject } from 'immutable-json-patch'
  import { isEmpty } from 'lodash-es'
  import { stringifyJSONPath, stripRootObject } from '$lib/utils/pathUtils.js'

  export let text: string | undefined
  export let json: JSONValue | undefined
  export let readOnly: boolean
  export let parser: JSONParser
  export let openJSONEditorModal: (path: JSONPath) => void
  export let onChangeMode: OnChangeMode

  $: action = readOnly ? '查看' : '编辑'

  let nestedArrayPaths: JSONPath[]
  $: nestedArrayPaths = json
    ? findNestedArrays(json)
        .slice(0, 99)
        .filter((path) => path.length > 0)
    : []
  $: hasNestedArrays = !isEmpty(nestedArrayPaths)

  $: documentType = hasNestedArrays
    ? '具有嵌套数组的对象'
    : json === undefined && (text === '' || text === undefined)
    ? '一个空文档'
    : isJSONObject(json)
    ? '一个对象'
    : isJSONArray(json)
    ? '一个空数组' // note: can also be an array with objects but without properties
    : `A ${valueType(json, parser)}`
</script>

<div class="jse-table-mode-welcome">
  <div class="jse-space jse-before" />

  <div class="jse-nested-arrays">
    <div class="jse-nested-arrays-title">{documentType}</div>
    <div class="jse-nested-arrays-info">
      {#if hasNestedArrays}
        对象不能使用表格模式。您可以改为打开嵌套数组，或以树模式打开文档。
      {:else}
        {documentType}不能使用表格模式。您可以改为打开嵌套数组，或以树模式打开文档。
      {/if}
    </div>
    {#each nestedArrayPaths as nestedArrayPath}
      {@const count = getIn(json, nestedArrayPath).length}

      <button
        type="button"
        class="jse-nested-array-action"
        on:click={() => openJSONEditorModal(nestedArrayPath)}
      >
        {action} "{stripRootObject(stringifyJSONPath(nestedArrayPath))}"
        <span class="jse-nested-array-count">({count} {count !== 1 ? 'items' : 'item'})</span>
      </button>
    {/each}
    <button type="button" class="jse-nested-array-action" on:click={() => onChangeMode(Mode.tree)}>
      使用树模式{action}
    </button>
  </div>

  <div class="jse-space jse-after" />
</div>

<style src="./TableModeWelcome.scss"></style>
