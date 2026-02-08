import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";
import type Listener from "./listener.ts";
import Additiveupgrade from "./additiveupgrade.ts";
import Multiplicativeupgrade from "./multiplicativeupgrade.ts";

export default class ClickerSimulation {
    #totalClicks: number;
    #clickPower: number;
    #upgrades: Array<Upgrade>;
    #listeners: Array<Listener>;

    constructor() {
        this.#totalClicks = 0;
        this.#clickPower = 1;
        this.#upgrades = new Array<Upgrade>();
        this.#listeners = new Array<Listener>();

        this.#checkClickerSimulation();
    }

    #checkClickerSimulation() {
        assert(this.#totalClicks >= 0, "Total Clicks must be greater or equal to 0");
        assert(this.#clickPower >= 0, "Click power must be greater or equal to 0");
    }

    // Getters:
    get totalClicks(): number {
        return this.#totalClicks;
    }

    get clickPower(): number {
        return this.#clickPower;
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
        this.#checkClickerSimulation();
    }

    getUpgradeById(id: string): Upgrade {
        const upgrade = this.#upgrades.find(u => u.id === id);
        if (!upgrade) throw new Error("Upgrade not found");
        return upgrade;
    }

    applyUpgrade(upgrade: Upgrade): void {

        if (this.#totalClicks - upgrade.cost < 0) {
            console.log(this.#totalClicks);
            console.log(upgrade.cost);
            console.log(upgrade.id.toString());
            console.log(this.#totalClicks - upgrade.cost);
            throw new InsuficientClicksException(upgrade.cost - this.totalClicks);
        }
        this.#totalClicks -= upgrade.cost;

        if(upgrade instanceof Additiveupgrade) {
            this.#clickPower += upgrade.additiveEffect;
        } else if(upgrade instanceof Multiplicativeupgrade) {
            this.#clickPower = Math.ceil(
                this.#clickPower *= upgrade.multiplicativeEffect);
        }
        upgrade.applyUpgrade();
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    updateTotalClicks(by: number): void {
        this.#totalClicks += by;
        this.notifyAll();
        this.#checkClickerSimulation();
    }

    // Listener methods:
    notifyAll(): void  {
        this.#listeners.forEach((listener: Listener) => {listener.notify()})
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }
}

export class InsuficientClicksException extends Error {
    public missing: number;

    constructor(missing: number) {
        super(`Insufficient clicks! Missing: ${missing}`);
        this.missing = missing;
    }
}