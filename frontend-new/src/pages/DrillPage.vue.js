import { ref } from "vue";
import { getDrillAnalysis, startDrill } from "../api/drill";
const loading = ref(false);
const error = ref("");
const count = ref(20);
const startResult = ref(null);
const analysis = ref(null);
async function start() {
    loading.value = true;
    error.value = "";
    try {
        startResult.value = await startDrill(count.value);
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function analyze() {
    loading.value = true;
    error.value = "";
    try {
        analysis.value = await getDrillAnalysis();
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "row between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "1",
    max: "200",
});
(__VLS_ctx.count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.start) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.analyze) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.startResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.startResult, null, 2));
}
if (__VLS_ctx.analysis) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.analysis, null, 2));
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            count: count,
            startResult: startResult,
            analysis: analysis,
            start: start,
            analyze: analyze,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
