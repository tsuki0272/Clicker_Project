import type {Upgrade} from "../model/upgrade.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import {InsuficientClicksException} from "../model/clickersimulation.ts";

export default class UpgradeView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;
    #currentUpgrade: Upgrade | null = null;

    constructor(controller: ClickerSimulationController, upgrades: Array<Upgrade>) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "upgrade-description";
        document.body.appendChild(this.#dialog);

        const container = document.querySelector("#upgrades-container")!;
        upgrades.forEach(upgrade => {
            const button = document.createElement("button");
            button.textContent = upgrade.name;
            button.style.cursor = "pointer";

            button.addEventListener("mouseover", () => {
                if (!this.#dialog.open) {
                    this.#controller.showUpgradeDescription(upgrade);
                }
            });
            button.addEventListener("mouseout", () => {
                this.#controller.closeUpgradeDescription();
            });
            button.addEventListener("click", () => {
                try {
                    this.#controller.closeUpgradeDescription();
                    this.#controller.applyUpgrade(upgrade);
                    this.#displayPurchasedDialog();
                } catch (e: any) {
                    if (e instanceof InsuficientClicksException) {
                        this.#displayErrorDialog(e.missing);
                    } else {
                        console.log("unexpected error " + e);
                    }
                }
            });

            container.appendChild(button);
        });
    }

    updateUpgradeDescription(upgrade: Upgrade) {
        this.#currentUpgrade = upgrade;
        this.render();
        this.#dialog.show();
    }

    render() {
        if (!this.#currentUpgrade) return;
        this.#dialog.innerHTML = `
            <p>${this.#currentUpgrade.description}</p>
            <p>Cost: ${this.#currentUpgrade.cost} clicks</p>
        `;
    }

    closeView() {
        this.#dialog.close();
        this.#currentUpgrade = null;
    }

    #displayPurchasedDialog() {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Purchased Upgrade!</p>`
        document.body.appendChild(this.#dialog);
        this.#dialog.show();
        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#dialog.close());
    }

    #displayErrorDialog(missing: number) {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Insufficient Clicks!</p>
            <p>You're missing ${missing} clicks</p>`
        document.body.appendChild(this.#dialog);
        this.#dialog.show();
        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#dialog.close());
    }

    notify(): void {
        if (this.#dialog.open && this.#currentUpgrade) {
            this.render();
        }
    }
}