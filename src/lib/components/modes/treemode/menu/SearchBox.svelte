<svelte:options immutable={true} />

<script lang="ts">
  import { debounce, noop } from 'lodash-es'
  import Icon from 'svelte-awesome'
  import {
    faCaretDown,
    faCaretRight,
    faChevronDown,
    faChevronUp,
    faCircleNotch,
    faSearch,
    faTimes
  } from '@fortawesome/free-solid-svg-icons'
  import { DEBOUNCE_DELAY, MAX_SEARCH_RESULTS } from '$lib/constants'
  import { keyComboFromEvent } from '$lib/utils/keyBindings'

  export let show = false
  export let searching: boolean
  export let resultCount = 0
  export let activeIndex = 0
  export let showReplace = false
  export let readOnly = false
  export let onChange: (search: string) => void = noop
  export let onPrevious: () => void = noop
  export let onNext: () => void = noop
  export let onReplace: (text: string, replaceText: string) => void = noop
  export let onReplaceAll: (text: string, replaceText: string) => void = noop
  export let onClose: () => void = noop

  let text = ''
  let previousText = ''
  let replaceText = ''

  $: formattedResultCount =
    resultCount >= MAX_SEARCH_RESULTS ? `${MAX_SEARCH_RESULTS - 1}+` : String(resultCount)

  $: onChangeDebounced = debounce(onChange, DEBOUNCE_DELAY)

  $: onChangeDebounced(text)

  $: if (show) {
    initShow()
  }

  function initShow() {
    if (text !== '') {
      onChange(text)
    }
  }

  function toggleShowReplace() {
    showReplace = !showReplace && !readOnly
  }

  function handleSubmit(event) {
    event.preventDefault()

    const pendingChanges = text !== previousText
    if (pendingChanges) {
      previousText = text
      onChangeDebounced.cancel()
      onChange(text)
    } else {
      onNext()
    }
  }

  function handleKeyDown(event) {
    // key events must not be handled by the generic keydown handler of the
    // whole JSONEditor.
    event.stopPropagation()
    const combo = keyComboFromEvent(event)

    if (combo === 'Enter') {
      event.preventDefault()
      onNext()
    }

    if (combo === 'Shift+Enter') {
      event.preventDefault()
      onPrevious()
    }

    if (combo === 'Ctrl+Enter') {
      event.preventDefault()

      if (showReplace) {
        handleReplace()
      } else {
        onNext()
        // TODO: move focus to the active element
      }
    }

    if (combo === 'Ctrl+H') {
      event.preventDefault()
      toggleShowReplace()
    }

    if (combo === 'Escape') {
      event.preventDefault()

      onClose()
    }
  }

  function handleReplace() {
    if (readOnly) {
      return
    }

    onReplace(text, replaceText)
  }

  function handleReplaceAll() {
    if (readOnly) {
      return
    }

    onReplaceAll(text, replaceText)
  }

  function initSearchInput(element) {
    element.select()
  }
</script>

{#if show}
  <div class="jse-search-box">
    <form class="jse-search-form" on:submit={handleSubmit} on:keydown={handleKeyDown}>
      {#if !readOnly}
        <button
          type="button"
          class="jse-replace-toggle"
          title="切换选项可见性 (Ctrl+H)"
          on:click={toggleShowReplace}
        >
          <Icon data={showReplace ? faCaretDown : faCaretRight} />
        </button>
      {/if}
      <div class="jse-search-contents">
        <div class="jse-search-section">
          <div class="jse-search-icon">
            {#if searching}
              <Icon data={faCircleNotch} spin />
            {:else}
              <Icon data={faSearch} />
            {/if}
          </div>
          <label class="jse-search-input-label" about="jse-search input">
            <input
              class="jse-search-input"
              title="输入内容进行搜索"
              type="text"
              placeholder="Find"
              bind:value={text}
              use:initSearchInput
            />
          </label>
          <div class="jse-search-count" class:jse-visible={text !== ''}>
            {activeIndex !== -1 ? `${activeIndex + 1}/` : ''}{formattedResultCount}
          </div>
          <button
            type="button"
            class="jse-search-next"
            title="跳到下一个匹配的搜索结果 (Enter)"
            on:click={() => onNext()}
          >
            <Icon data={faChevronDown} />
          </button>
          <button
            type="button"
            class="jse-search-previous"
            title="跳到上一个匹配的搜索结果 (Shift+Enter)"
            on:click={() => onPrevious()}
          >
            <Icon data={faChevronUp} />
          </button>
          <button
            type="button"
            class="jse-search-clear"
            title="关闭搜索框 (Esc)"
            on:click={() => onClose()}
          >
            <Icon data={faTimes} />
          </button>
        </div>
        {#if showReplace && !readOnly}
          <div class="jse-replace-section">
            <input
              class="jse-replace-input"
              title="输入替换的内容"
              type="text"
              placeholder="Replace"
              bind:value={replaceText}
            />
            <button
              type="button"
              title="替换当前选择内容 (Ctrl+Enter)"
              on:click={handleReplace}>Replace</button
            >
            <button type="button" title="替换所有内容" on:click={handleReplaceAll}
              >All</button
            >
          </div>
        {/if}
      </div>
    </form>
  </div>
{/if}

<style src="./SearchBox.scss"></style>
