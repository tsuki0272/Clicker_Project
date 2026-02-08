import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";

export default class Additiveupgrade implements Upgrade {
    #id: string;
    #description: string;
    #cost: number;
    #additiveEffect: number;
    #listeners: Array<Listener>;

    constructor(id: string, cost: number, additiveEffect: number) {
        this.#id = id;
        this.#description = `Increases CLICK POWER by ${additiveEffect}`;
        this.#cost = cost;
        this.#additiveEffect = additiveEffect;
        this.#listeners = new Array<Listener>();

        this.#checkUpgrade();
    }

    #checkUpgrade() {
        assert(this.#description.length > 0, "Description length must be greater than 0");
    }

    get id(): string {
        return this.#id;
    }

    set description(description: string) {
        this.#description = description;
    }

    get description() : string {
        return this.#description;
    }

    get cost(): number {
        return this.#cost;
    }

    get additiveEffect() : number {
        return this.#additiveEffect;
    }

    applyUpgrade() : void {
        this.#additiveEffect++;
        this.#cost *= 2;
        this.#checkUpgrade();
        this.#description = `Increases CLICK POWER by ${this.#additiveEffect}`;
        this.notifyAll();
    }

    notifyAll(): void  {
        this.#listeners.forEach((listener: Listener) => {listener.notify()})
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}