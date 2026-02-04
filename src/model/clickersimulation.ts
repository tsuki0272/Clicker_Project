import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";

export default class Clickersimulation {
    #totalClicks: number;
    #clickPower: number;
    #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;

    constructor() {
        this.#totalClicks = 0;
        this.#clickPower = 1;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();

        this.#checkPokemon();
    }

    #checkPokemon() {
        assert(this.#totalClicks >= 0, "Total Clicks must be greater or equal to 0");
        assert(this.#clickPower >= 0, "Click power must be greater or equal to 0");
    }

    // Getters:
    get totalClicks(): number {
        return this.#totalClicks;
    }

    get upgrades(): Array<Upgrade> {
        return this.#upgrades;
    }

    // Adds an upgrade if it doesn't already exist in the upgrades list
    addUpgrade(upgrade: Upgrade): void {
        if (!this.#upgrades.includes(upgrade)) {
            this.#upgrades.push(upgrade);
        }
        this.notifyAll();
    }

    // Updates the click power by some amount. Must be greater or equal to 0.
    changeClickPower(by: number) : number {
        if (this.#clickPower + by >= 0) {
            this.#clickPower += by;
        }
        this.#checkPokemon();
        this.notifyAll();

        return this.#clickPower;
    }

    // Listener methods:
    notifyAll(): void  {
        this.#listeners.forEach((listener: Listener) => {listener.notify()})
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}