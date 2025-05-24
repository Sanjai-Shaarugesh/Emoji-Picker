import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type CounterProps = typeof __propDef.props;
export type CounterEvents = typeof __propDef.events;
export type CounterSlots = typeof __propDef.slots;
export default class Counter extends SvelteComponentTyped<CounterProps, CounterEvents, CounterSlots> {
}
export {};
