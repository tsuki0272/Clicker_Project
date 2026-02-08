import Clickersimulation, {InsuficientClicksException} from "../model/clickersimulation.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

export default class ClickerSimulationView {
    #clickerSimulation: Clickersimulation;
    #totalClicks: HTMLParagraphElement;
    #clickPower: HTMLParagraphElement;
    #dialog: HTMLDialogElement;
    #controller: ClickerSimulationController;


    constructor(clickerSimulation: Clickersimulation, controller : ClickerSimulationController) {
        this.#clickerSimulation = clickerSimulation;
        this.#clickerSimulation.registerListener(this);
        this.#controller = controller;

        document.querySelector('#clickerSim')!.innerHTML =
            `
            <p id="totalClicks"> ${this.#clickerSimulation.totalClicks} </p>
            <p id="clickPower"> ${this.#clickerSimulation.clickPower} </p>
            <button type="button" id="clicker-button">
                <img src="assets/Cursor.webp" height="256" width="256" alt="Cursor image"/>
            </button>`

        this.#totalClicks = document.querySelector("#totalClicks")!;
        this.#clickPower = document.querySelector("#clickPower")!;

        document.querySelector("#clicker-button")!
            .addEventListener("click",
                () => {
                    // update clicks by click amount
                    this.#controller.updateTotalClicks();
                })

        document.querySelector("#upgradesSection")!.innerHTML =
            `<div id='clickerSimulation'>
                <button id="add-additive-upgrade1">Additive Upgrade 1</button>
                <button id="add-multiplicative-upgrade1">Multiplicative Upgrade 1</button>
                <ul></ul>
            </div>`

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "purchased-upgrade-dialog";

        document.querySelector("#add-additive-upgrade1")!.addEventListener("mouseover", () => {
            if(!this.#dialog.open) {
                this.#controller.showUpgradeDescription("additiveUpgrade1");
            }
        });

        document.querySelector("#add-additive-upgrade1")!.addEventListener("mouseout", () => {
            this.#controller.closeUpgradeDescription();
        });

        document.querySelector("#add-additive-upgrade1")!
            .addEventListener("click",
                () => {
                try {
                    this.#controller.closeUpgradeDescription();
                    this.#controller.applyUpgrade("additiveUpgrade1");
                    this.#displayPurchasedUpgradeDialog();
                } catch (e: any) {
                    if (e instanceof InsuficientClicksException) {
                        this.#displayErrorDialog(e.missing);
                        console.error(e);
                    } else {
                        // unexpected errors can be logged so that we can add them to the
                        // try catch or figure out what the problem was.
                        console.log("unexpected error " + e);
                    }
                }
            });

        document.querySelector("#add-multiplicative-upgrade1")!.addEventListener("mouseover", () => {
            if(!this.#dialog.open) {
                this.#controller.showUpgradeDescription("multiplicativeUpgrade1");
            }
        });

        document.querySelector("#add-multiplicative-upgrade1")!.addEventListener("mouseout", () => {
            this.#controller.closeUpgradeDescription();
        });

        document.querySelector("#add-multiplicative-upgrade1")!
            .addEventListener("click",
                () => {
                    try {
                        this.#controller.closeUpgradeDescription();
                        this.#controller.applyUpgrade("multiplicativeUpgrade1");
                        this.#displayPurchasedUpgradeDialog();
                    } catch (e: any) {
                        if (e instanceof InsuficientClicksException) {
                            this.#displayErrorDialog(e.missing);
                            console.error(e);
                        } else {
                            // unexpected errors can be logged so that we can add them to the
                            // try catch or figure out what the problem was.
                            console.log("unexpected error " + e);
                        }
                    }
                });
    }

    #displayPurchasedUpgradeDialog() {
        this.#dialog.innerHTML = `
        <button>X</button>
        <p>Purchased Upgrade!</p>`

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#closeDialog())
    }

    #displayErrorDialog(missing: number) {
        this.#dialog.innerHTML = `
            <button>X</button>\
            <p>Insufficient Clicks!</p>
            <p>You're missing ${missing} clicks</p>`

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#closeDialog())
    }

    #closeDialog() {
        this.#dialog.close();
        document.body.removeChild(this.#dialog);
    }

    notify(): void {
        this.#totalClicks.textContent = `Total clicks: ${this.#clickerSimulation.totalClicks}`;
        this.#clickPower.textContent = `Click power: ${this.#clickerSimulation.clickPower}`;
    }
}