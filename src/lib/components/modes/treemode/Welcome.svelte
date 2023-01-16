<svelte:options immutable={true} />

<script lang="ts">
  export let readOnly: boolean
</script>

<div class="jse-welcome">
  <div class="jse-space jse-before" />
  <div class="jse-contents">
    Empty document
    {#if !readOnly}
      <ul>
        <li>在编辑器内点击</li>
        <li>使用<span class="jse-bold">Ctrl+V</span>粘贴剪切板的内容</li>
        <li>输入<span class="jse-bold">&lbrace;</span>创建新对象</li>
        <li>输入<span class="jse-bold">[</span>创建新数组</li>
      </ul>
    {/if}
  </div>
  <div class="jse-space jse-after" />
</div>

<style src="./Welcome.scss"></style>
