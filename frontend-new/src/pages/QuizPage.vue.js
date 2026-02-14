import { computed, ref } from "vue";
import { getQuestion } from "../api/question";
import { getCurrentQuestion, jumpTo, nextQuestion, previousQuestion, resetQuiz, startQuiz, submitAnswer } from "../api/quiz";
const loading = ref(false);
const error = ref("");
const current = ref(null);
const currentIndex = ref(0);
const totalQuestions = ref(0);
const answerInput = ref("");
const selectedOptions = ref([]);
const autoNext = ref(true);
const result = ref(null);
const cardStatusMap = ref({});
const cardIndexes = computed(() => Array.from({ length: totalQuestions.value }, (_, i) => i));
const resultData = computed(() => {
    if (!result.value)
        return null;
    return {
        questionId: String(result.value.questionId || ""),
        isCorrect: Boolean(result.value.isCorrect),
        userAnswer: String(result.value.userAnswer || ""),
        correctAnswer: String(result.value.correctAnswer || ""),
        explanation: String(result.value.explanation || "")
    };
});
function normalizeAnswer() {
    if (selectedOptions.value.length > 0) {
        const sorted = [...selectedOptions.value].sort();
        answerInput.value = sorted.join(",");
    }
}
function isMultiChoice() {
    return current.value?.type === "多选题";
}
function toggleOption(letter) {
    if (isMultiChoice()) {
        if (selectedOptions.value.includes(letter)) {
            selectedOptions.value = selectedOptions.value.filter((v) => v !== letter);
        }
        else {
            selectedOptions.value = [...selectedOptions.value, letter];
        }
    }
    else {
        selectedOptions.value = [letter];
    }
    normalizeAnswer();
}
function hydrateAnswerFromText(answer) {
    answerInput.value = answer || "";
    selectedOptions.value = (answer || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => v.toUpperCase());
}
async function enrichQuestion(base) {
    const id = String(base.id || "");
    if (!id) {
        current.value = null;
        return;
    }
    try {
        current.value = await getQuestion(id);
    }
    catch {
        current.value = {
            id,
            type: String(base.type || ""),
            text: String(base.text || ""),
            answer: String(base.answer || ""),
            explanation: String(base.explanation || "")
        };
    }
}
async function applyQuestionPayload(payload) {
    currentIndex.value = Number(payload.currentIndex ?? currentIndex.value);
    totalQuestions.value = Number(payload.totalQuestions ?? totalQuestions.value);
    const data = payload.data;
    if (!data) {
        return;
    }
    await enrichQuestion(data);
    const ua = payload.userAnswer;
    if (ua?.answer) {
        hydrateAnswerFromText(String(ua.answer));
        const ok = Boolean(ua.isCorrect);
        cardStatusMap.value[currentIndex.value] = ok ? "correct" : "wrong";
    }
    else {
        hydrateAnswerFromText("");
    }
}
async function start() {
    loading.value = true;
    error.value = "";
    result.value = null;
    cardStatusMap.value = {};
    try {
        const started = await startQuiz({});
        totalQuestions.value = Number(started.totalQuestions ?? 0);
        const payload = await getCurrentQuestion(0, "normal");
        await applyQuestionPayload(payload);
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function submitCurrent() {
    if (!current.value)
        return;
    loading.value = true;
    error.value = "";
    try {
        const data = await submitAnswer({
            questionId: current.value.id,
            userAnswer: answerInput.value.trim(),
            mode: "normal"
        });
        result.value = data;
        const ok = Boolean(data.isCorrect);
        cardStatusMap.value[currentIndex.value] = ok ? "correct" : "wrong";
        if (autoNext.value && currentIndex.value < totalQuestions.value - 1) {
            setTimeout(() => {
                void next();
            }, 500);
        }
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function next() {
    if (currentIndex.value >= totalQuestions.value - 1)
        return;
    loading.value = true;
    error.value = "";
    try {
        const payload = await nextQuestion(currentIndex.value, "normal");
        if (payload.data) {
            await applyQuestionPayload(payload);
        }
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function prev() {
    if (currentIndex.value <= 0)
        return;
    loading.value = true;
    error.value = "";
    try {
        const payload = await previousQuestion(currentIndex.value, "normal");
        if (payload.data) {
            await applyQuestionPayload(payload);
        }
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function jump(idx) {
    if (idx < 0 || idx >= totalQuestions.value)
        return;
    loading.value = true;
    error.value = "";
    try {
        const payload = await jumpTo(idx, "normal");
        await applyQuestionPayload(payload);
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
async function resetSession() {
    loading.value = true;
    error.value = "";
    try {
        await resetQuiz();
        current.value = null;
        currentIndex.value = 0;
        totalQuestions.value = 0;
        result.value = null;
        answerInput.value = "";
        selectedOptions.value = [];
        cardStatusMap.value = {};
    }
    catch (e) {
        error.value = e.message;
    }
    finally {
        loading.value = false;
    }
}
function cardClass(idx) {
    if (idx === currentIndex.value)
        return "current";
    const status = cardStatusMap.value[idx] || "unanswered";
    return status;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['opt']} */ ;
/** @type {__VLS_StyleScopedClasses['opt']} */ ;
/** @type {__VLS_StyleScopedClasses['card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['result-flag']} */ ;
/** @type {__VLS_StyleScopedClasses['result-flag']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-box']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-box']} */ ;
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
    ...{ class: "row wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.start) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetSession) },
    ...{ class: "btn" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "row check" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.autoNext);
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    (__VLS_ctx.error);
}
if (!__VLS_ctx.current) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
}
if (__VLS_ctx.current) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row between" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.current.type);
    (__VLS_ctx.current.id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentIndex + 1);
    (__VLS_ctx.totalQuestions);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "question" },
    });
    (__VLS_ctx.current.text);
    if ((__VLS_ctx.current.options || []).length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "options" },
        });
        for (const [opt] of __VLS_getVForSourceType((__VLS_ctx.current.options))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.current))
                            return;
                        if (!((__VLS_ctx.current.options || []).length > 0))
                            return;
                        __VLS_ctx.toggleOption(opt.letter);
                    } },
                key: (opt.letter),
                ...{ class: "opt" },
                ...{ class: ({ selected: __VLS_ctx.selectedOptions.includes(opt.letter) }) },
                type: "button",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (opt.letter);
            (opt.text);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
            value: (__VLS_ctx.answerInput),
            rows: "4",
            placeholder: "输入答案",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row wrap top-gap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "答案（自动由选项生成）",
    });
    (__VLS_ctx.answerInput);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitCurrent) },
        ...{ class: "btn primary" },
        disabled: (__VLS_ctx.loading || !__VLS_ctx.answerInput.trim()),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.prev) },
        ...{ class: "btn" },
        disabled: (__VLS_ctx.loading || __VLS_ctx.currentIndex <= 0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.next) },
        ...{ class: "btn" },
        disabled: (__VLS_ctx.loading || __VLS_ctx.currentIndex >= __VLS_ctx.totalQuestions - 1),
    });
    if (__VLS_ctx.totalQuestions > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-grid top-gap" },
        });
        for (const [idx] of __VLS_getVForSourceType((__VLS_ctx.cardIndexes))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.current))
                            return;
                        if (!(__VLS_ctx.totalQuestions > 0))
                            return;
                        __VLS_ctx.jump(idx);
                    } },
                key: (idx),
                ...{ class: "card-btn" },
                ...{ class: (__VLS_ctx.cardClass(idx)) },
                disabled: (__VLS_ctx.loading),
                type: "button",
            });
            (idx + 1);
        }
    }
}
if (__VLS_ctx.resultData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-grid top-gap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.resultData.questionId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.resultData.isCorrect ? "正确" : "错误");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.resultData.userAnswer || "-");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.resultData.correctAnswer || "-");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "result-flag top-gap" },
        ...{ class: (__VLS_ctx.resultData.isCorrect ? 'ok' : 'bad') },
    });
    (__VLS_ctx.resultData.isCorrect ? "回答正确，继续保持。" : "本题答错了，建议先看解析再继续。");
    if (__VLS_ctx.resultData.explanation) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "explain-box top-gap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.resultData.explanation);
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['check']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['between']} */ ;
/** @type {__VLS_StyleScopedClasses['question']} */ ;
/** @type {__VLS_StyleScopedClasses['options']} */ ;
/** @type {__VLS_StyleScopedClasses['opt']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-flag']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-box']} */ ;
/** @type {__VLS_StyleScopedClasses['top-gap']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            error: error,
            current: current,
            currentIndex: currentIndex,
            totalQuestions: totalQuestions,
            answerInput: answerInput,
            selectedOptions: selectedOptions,
            autoNext: autoNext,
            cardIndexes: cardIndexes,
            resultData: resultData,
            toggleOption: toggleOption,
            start: start,
            submitCurrent: submitCurrent,
            next: next,
            prev: prev,
            jump: jump,
            resetSession: resetSession,
            cardClass: cardClass,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
