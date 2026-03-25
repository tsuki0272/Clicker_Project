import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import type {Building} from "../model/building.ts";
import {InsuficientClicksException} from "../model/clickersimulation.ts";

export default class BuildingView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;
    #currentBuilding: Building | null = null;

    constructor(controller: ClickerSimulationController, buildings: Array<Building>) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "building-description";
        document.body.appendChild(this.#dialog);

        const container = document.querySelector("#buildings-container")!;
        buildings.forEach(building => {
            const button = document.createElement("button");
            button.textContent = building.name;
            button.style.cursor = "pointer";

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

            container.appendChild(button);
        });
    }

    updateBuildingDescription(building: Building) {
        this.#currentBuilding = building;
        this.render();
        this.#dialog.show();
    }

    render() {
        if (!this.#currentBuilding) return;
        this.#dialog.innerHTML = `
            <p>${this.#currentBuilding.description}</p>
            <p>Cost: ${this.#currentBuilding.cost} clicks</p>
        `;
    }

    closeView() {
        this.#dialog.close();
        this.#currentBuilding = null;
    }

    #displayPurchasedDialog() {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Purchased Building!</p>`
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
        if (this.#dialog.open && this.#currentBuilding) {
            this.render();
        }
    }
}