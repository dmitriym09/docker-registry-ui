export const dispatch = (eventName) => {
    window.dispatchEvent(new Event(eventName));
};