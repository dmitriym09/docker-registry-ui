export const dispatch = (eventName, data = undefined) => {
    window.dispatchEvent(new CustomEvent(eventName), {
        'detail': data
    });
};