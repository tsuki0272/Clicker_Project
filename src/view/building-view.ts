import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import type {Building} from "../model/building.ts";
import {InsuficientClicksException} from "../model/clickersimulation.ts";

/**
 * Renders the list of purchasable buildings and manages the description
 * dialog shown on hover. Handles purchase attempts and displays feedback
 * dialogs for success or insufficient clicks.
 */
export default class BuildingView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;
    #currentBuilding: Building | null = null;
    #buttons: Map<Building, HTMLButtonElement> = new Map();

    constructor(controller: ClickerSimulationController, buildings: Array<Building>) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "building-description";
        document.body.appendChild(this.#dialog);

        const container = document.querySelector("#buildings-container")!;
        buildings.forEach(building => {
            const button = document.createElement("button");
            button.textContent = building.description;
            button.disabled = true;

            button.addEventListener("mouseover", () => {
                if (!this.#dialog.open) {
                    this.#controller.showBuildingDescription(building);
                }
            });
            button.addEventListener("mouseout", () => {
                this.#controller.closeBuildingDescription();
            });
            button.addEventListener("click", () => {
                try {
                    this.#controller.closeBuildingDescription();
                    this.#controller.applyBuilding(building);
                    this.#displayPurchasedDialog();
                } catch (e: any) {
                    if (e instanceof InsuficientClicksException) {
                        this.#displayErrorDialog(e.missing);
                    } else {
                        console.log("unexpected error " + e);
                    }
                }
            });

            this.#buttons.set(building, button);
            container.appendChild(button);
        });
    }

    /**
     * Sets the currently displayed building and opens the description dialog.
     */
    updateBuildingDescription(building: Building) {
        this.#currentBuilding = building;
        this.render();
        this.#dialog.show();
    }

    /**
     * Re-renders the description dialog content for the current building.
     */
    render() {
        if (!this.#currentBuilding) return;
        this.#dialog.innerHTML = `
            <p>${this.#currentBuilding.description}</p>
            <p>Cost: ${this.#currentBuilding.cost} clicks</p>
        `;
    }

    /**
     * Closes the description dialog and clears the current building reference.
     */
    closeView() {
        this.#dialog.close();
        this.#currentBuilding = null;
    }

    /**
     * Displays a confirmation dialog after a successful building purchase.
     */
    #displayPurchasedDialog() {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Purchased Building!</p>`
        document.body.appendChild(this.#dialog);
        this.#dialog.show();
        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#dialog.close());
    }

    /**
     * Displays an error dialog when the player does not have enough clicks
     * to purchase the building.
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
     * and updates each button's disabled state to indicate whether it is affordable.
     */
    notify(): void {
        if (this.#dialog.open && this.#currentBuilding) {
            this.render();
        }
        const totalClicks = this.#controller.totalClicks;
        this.#buttons.forEach((button, building) => {
            button.disabled = building.cost > totalClicks;
        });
    }
}