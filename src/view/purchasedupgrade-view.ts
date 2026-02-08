import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

export default class PurchasedUpgradeView {
    #controller: ClickerSimulationController;
    #dialog: HTMLDialogElement;

    constructor(controller: ClickerSimulationController) {
        this.#controller = controller;

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "purchased-upgrade-dialog";
        this.#dialog.innerHTML = `
        <p>Purchased Upgrade!</p>
        <button>X</button>`

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#close())
    }

    #close() {
        document.body.removeChild(this.#dialog);
    }
}