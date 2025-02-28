<template>
    <div h-100vh overflow-hidden bg-warmgray-200 dark:bg-dark-900>
        <div relative float-left h-100vh>
            <div h-inherit w-240px cursor-col-resize cursor-e-resize resize-x overflow-scroll rounded-2 opacity-0 class="resize-bar" />
            <div absolute bottom-0 left-0 right-5px top-0 flex overflow-x-hidden>
                <FileTree />
            </div>
        </div>
        <div h-100vh flex overflow-hidden>
            <CodeSpace />
        </div>
        <TemplateSelect />
        <TemplateSet />
    </div>
</template>

<style>
.resize-bar::-webkit-scrollbar {
    @apply h-inherit w-200px b-rd-0.5rem;
}
</style>
