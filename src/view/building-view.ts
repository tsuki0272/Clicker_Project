import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";
import type {Building} from "../model/building.ts";

export default class BuildingView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;
    #currentBuilding: Building | null = null;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "building-description";
        document.body.appendChild(this.#dialog);
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

    notify(): void {
        // Only re-render if dialog is currently visible
        if (this.#dialog.open && this.#currentBuilding) {
            this.render();
        }
    }
}