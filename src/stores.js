import { writable } from 'svelte/store';

export const isBlocked = writable(true);
export const updateDockerImgs = writable(Date.now());