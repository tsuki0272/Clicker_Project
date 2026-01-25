import type Clickersimulation from "../model/clickersimulation.ts";
import type {Upgrade} from "../model/upgrade.ts";

export default class ClickerSimulationView {
    #clickerSimulation: Clickersimulation;
    #upgradesEl: HTMLUListElement;

    constructor(clickerSimulation: Clickersimulation) {
        this.#clickerSimulation = clickerSimulation;
        this.#clickerSimulation.registerListener(this);

        document.querySelector("#app")!.innerHTML =
            "<div id='clickerSimulation'><ul></ul></div>"

        this.#upgradesEl = document.querySelector("#clickerSimulation > ul")!;
    }

    notify(): void {
        this.#upgradesEl.replaceChildren();

        this.#clickerSimulation.upgrades.forEach((upgrade) => {
            let upgradeEl = document.createElement("li");
            upgradeEl.innerHTML = `<strong>${upgrade.description}</strong>`;
            this.#upgradesEl.appendChild(upgradeEl);
        })
    }
}