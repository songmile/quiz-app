import { onMounted, ref } from "vue";
import { deleteBookmark, getBookmarks } from "../../api/bookmark";
const loading = ref(false);
const error = ref("");
const bookmarks = ref([]);
async function load() {
    loading.value = true;
    error.value = "";
    try {
        bookmarks.value = await getBookmarks();
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function remove(questionId) {
    if (!confirm("确认取消收藏？"))
        return;
    try {
        await deleteBookmark(questionId);
        await load();
    }
    catch (e) {
        error.value = e.message;
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "row between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "table" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
for (const [b] of __VLS_getVForSourceType((__VLS_ctx.bookmarks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (b.questionId),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (b.questionId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (b.question?.text);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (b.question?.type);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    (b.createdAt);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.remove(b.questionId);
            } },
        ...{ class: "btn danger" },
    });
}
if (__VLS_ctx.bookmarks.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: "5",
    });
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            bookmarks: bookmarks,
            load: load,
            remove: remove,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
