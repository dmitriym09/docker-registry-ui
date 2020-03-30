import { writable } from 'svelte/store';

export const isBlocked = writable(true);
export const imgs = writable({});