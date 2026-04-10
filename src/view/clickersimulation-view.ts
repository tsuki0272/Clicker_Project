import Clickersimulation from "../model/clickersimulation.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

/**
 * Renders the main game UI including the clicker button, stats display,
 * and containers for upgrades and buildings. Also drives the auto-click
 * loop via setInterval, simulating passive income from buildings.
 */
export default class ClickerSimulationView {
    #clickerSimulation: Clickersimulation;
    #totalClicks: HTMLParagraphElement;
    #clickPower: HTMLParagraphElement;
    #autoCPS: HTMLParagraphElement;
    #dialog: HTMLDialogElement;
    #controller: ClickerSimulationController;
    #roboBuyButton: HTMLButtonElement;

    constructor(clickerSimulation: Clickersimulation, controller: ClickerSimulationController) {
        this.#clickerSimulation = clickerSimulation;
        this.#clickerSimulation.registerListener(this);
        this.#controller = controller;

        document.querySelector('#clickerSim')!.innerHTML = `
            <p id="username-display">Logged in as: <b>${this.#clickerSimulation.username}</b></p>
            <p id="totalClicks"> <b>Total clicks:</b> ${this.#clickerSimulation.totalClicks} </p>
            <p id="clickPower"> <b>Click power:</b> ${this.#clickerSimulation.clickPower} </p>
            <p id="autoCPS"> <b>Auto CPS:</b> ${this.#clickerSimulation.autoCPS} </p>
            <button type="button" id="clicker-button" style="cursor: pointer;">
                <img src="assets/Cursor.webp" height="256" width="256" alt="Cursor image"/>
            </button>
            <p>Click the cursor to earn clicks!</p>
            <button type="button" id="robo-buy-button" disabled>Robo-Buy: OFF</button>`

        this.#totalClicks = document.querySelector("#totalClicks")!;
        this.#clickPower = document.querySelector("#clickPower")!;
        this.#autoCPS = document.querySelector("#autoCPS")!;
        this.#roboBuyButton = document.querySelector("#robo-buy-button")!;

        document.querySelector("#clicker-button")!
            .addEventListener("click", () => {
                this.#controller.updateTotalClicks();
            });

        this.#roboBuyButton.addEventListener("click", () => {
            this.#controller.toggleRoboBuy();
            this.notify();
        });

        document.querySelector("#purchasablesSection")!.innerHTML =
            `<div id='clickerSimulation'>
                <p><b>Upgrades:</b></p>
                <div id="upgrades-container"></div>
                <p><b>Buildings:</b></p>
                <div id="buildings-container"></div>
            </div>`

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "purchase-dialog";

        /**
         * Drives passive income by calling updateTotalClicksAuto every second,
         * mirroring the same controller method used by the manual click button.
         */
        setInterval(() => {
            if (this.#clickerSimulation.autoCPS > 0) {
                this.#controller.updateTotalClicksAuto();
            }
        }, 1000);

        this.notify();
    }

    /**
     * Re-renders the stats display in response to model state changes.
     * Also keeps the robo-buy button label and enabled state in sync.
     */
    notify(): void {
        this.#totalClicks.innerHTML = `<b>Total clicks:</b> ${this.#clickerSimulation.totalClicks}`;
        this.#clickPower.innerHTML = `<b>Click power:</b> ${this.#clickerSimulation.clickPower}`;
        this.#autoCPS.innerHTML = `<b>Auto CPS:</b> ${this.#clickerSimulation.autoCPS}`;
        this.#roboBuyButton.disabled = this.#clickerSimulation.upgradesPurchased === 0;
        this.#roboBuyButton.textContent = `Robo-Buy: ${this.#controller.roboBuyActive ? 'ON' : 'OFF'}`;
    }
}