import type {Upgrade} from "../model/upgrade.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import {InsuficientClicksException} from "../model/clickersimulation.ts";

/**
 * Renders the list of purchasable upgrades and manages the description
 * dialog shown on hover. Handles purchase attempts and displays feedback
 * dialogs for success or insufficient clicks.
 */
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

    /**
     * Sets the currently displayed upgrade and opens the description dialog.
     */
    updateUpgradeDescription(upgrade: Upgrade) {
        this.#currentUpgrade = upgrade;
        this.render();
        this.#dialog.show();
    }

    /**
     * Re-renders the description dialog content for the current upgrade.
     */
    render() {
        if (!this.#currentUpgrade) return;
        this.#dialog.innerHTML = `
            <p>${this.#currentUpgrade.description}</p>
            <p>Cost: ${this.#currentUpgrade.cost} clicks</p>
        `;
    }

    /**
     * Closes the description dialog and clears the current upgrade reference.
     */
    closeView() {
        this.#dialog.close();
        this.#currentUpgrade = null;
    }

    /**
     * Displays a confirmation dialog after a successful upgrade purchase.
     */
    #displayPurchasedDialog() {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Purchased Upgrade!</p>`
        document.body.appendChild(this.#dialog);
        this.#dialog.show();
        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#dialog.close());
    }

    /**
     * Displays an error dialog when the player does not have enough clicks
     * to purchase the upgrade.
     */
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

    /**
     * Re-renders the description dialog if it is currently open,
     * called when the model notifies of a state change.
     */
    notify(): void {
        if (this.#dialog.open && this.#currentUpgrade) {
            this.render();
        }
    }
}