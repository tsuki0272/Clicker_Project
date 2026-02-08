import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";

export default class Multiplicativeupgrade implements Upgrade {
    #id: string;
    #description: string;
    #cost: number;
    #multiplicativeEffect: number;
    #listeners: Array<Listener>;

    constructor(id: string, cost: number, multiplicativeEffect: number) {
        this.#id = id;
        this.#description = `Multiplies CLICK POWER by ${multiplicativeEffect}`;
        this.#cost = cost;
        this.#multiplicativeEffect = multiplicativeEffect;
        this.#listeners = new Array<Listener>();

        this.#checkUpgrade();
    }

    #checkUpgrade() {
        assert(this.#description.length > 0, "Description length must be greater than 0");
    }

    get id(): string {
        return this.#id;
    }

    get description() : string {
        return this.#description;
    }

    get cost(): number {
        return this.#cost;
    }

    get multiplicativeEffect() : number {
        return this.#multiplicativeEffect;
    }

    applyUpgrade() : void {
        this.#multiplicativeEffect += 0.1;
        this.#cost *= 2;
        this.#description = `Multiplies CLICK POWER by ${this.#multiplicativeEffect.toFixed(2)}`;
        this.#checkUpgrade();
    }

    notifyAll(): void  {
        this.#listeners.forEach((listener: Listener) => {listener.notify()})
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}