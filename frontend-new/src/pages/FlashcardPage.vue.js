import { ref } from "vue";
import { getFlashcardInfo, rateFlashcard, startFlashcards } from "../api/flashcard";
const loading = ref(false);
const error = ref("");
const session = ref(null);
const info = ref(null);
const result = ref(null);
const questionId = ref("");
const rating = ref("good");
async function start() {
    loading.value = true;
    error.value = "";
    try {
        session.value = await startFlashcards({ source: "all", limit: 20 });
        info.value = await getFlashcardInfo();
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function refresh() {
    try {
        info.value = await getFlashcardInfo();
    }
    catch (e) {
        error.value = e.message;
    }
}
async function rate() {
    loading.value = true;
    error.value = "";
    try {
        result.value = await rateFlashcard({ questionId: questionId.value, rating: rating.value });
        await refresh();
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.start) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.refresh) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.session) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.session, null, 2));
}
if (__VLS_ctx.info) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.info, null, 2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel row wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    placeholder: "questionId",
});
(__VLS_ctx.questionId);
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.rating),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "again",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "hard",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "good",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "easy",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.rate) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading || !__VLS_ctx.questionId),
});
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (JSON.stringify(__VLS_ctx.result, null, 2));
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
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            session: session,
            info: info,
            result: result,
            questionId: questionId,
            rating: rating,
            start: start,
            refresh: refresh,
            rate: rate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
