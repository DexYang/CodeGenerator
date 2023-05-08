<template>
    <div overflow-hidden h-100vh bg-warmGray-200 dark:bg-dark-900>
        <div relative h-100vh float-left>
            <div w-200px h-inherit resize-x cursor-e-resize cursor-col-resize opacity-0 overflow-scroll class="resize-bar" />
            <div absolute top-0 right-5px bottom-0 left-0 overflow-x-hidden flex>
                <FileTree />
            </div>
        </div>
        <div h-100vh flex overflow-hidden>
            <CodeSpace />
        </div>
        <TemplateChoose />
        <TemplateSet />
    </div>
</template>

<style>
.resize-bar::-webkit-scrollbar {
  height: inherit;
  width: 200px;
}
</style>
