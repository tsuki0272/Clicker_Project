import {assert} from "../assertions.ts";
import type {Upgrade} from "./upgrade.ts";

export default class Multiplicativeupgrade implements Upgrade {
    #description: string;
    #timesApplied: number;

    constructor(description: string) {
        this.#description = description;
        this.#timesApplied = 0;

        this.#checkUpgrade();
    }

    #checkUpgrade() {
        assert(this.#description.length > 0, "Description length must be greater than 0");
        assert(this.#timesApplied >= 0, "Times applied must be greater or equal to 0");
    }

    get description() : string {
        return this.#description;
    }

    applyUpgrade() : void {
        this.#timesApplied++;
        this.#checkUpgrade();
    }
}