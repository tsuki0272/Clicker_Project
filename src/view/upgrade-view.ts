import type {Upgrade} from "../model/upgrade.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

export default class UpgradeView {
    #upgrade: Upgrade;
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;

    constructor(upgrade: Upgrade, controller : ClickerSimulationController) {
        this.#upgrade = upgrade;
        this.#upgrade.registerListener(this);
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "upgrade-description";
        document.body.appendChild(this.#dialog);
    }

    updateUpgradeDescription(upgrade: Upgrade) {
        this.#upgrade = upgrade;
        this.render();
        this.#dialog.show();
    }

    render() {
        this.#dialog.innerHTML = `
            <p>${this.#upgrade.description}</p>
            <p>Cost: ${this.#upgrade.cost} clicks</p>
        `;
    }

    closeView() {
        this.#dialog.close();
    }

    notify(): void {
        this.#dialog.close();
        this.render();
        this.#dialog.show();
    }
}