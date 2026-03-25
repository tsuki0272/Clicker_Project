import Clickersimulation, {InsuficientClicksException} from "../model/clickersimulation.ts";
import type ClickerSimulationController from "../controller/clickersimulation-controller.ts";

export default class ClickerSimulationView {
    #clickerSimulation: Clickersimulation;
    #totalClicks: HTMLParagraphElement;
    #clickPower: HTMLParagraphElement;
    #autoCPS: HTMLParagraphElement;
    #dialog: HTMLDialogElement;
    #controller: ClickerSimulationController;


    constructor(clickerSimulation: Clickersimulation, controller : ClickerSimulationController) {
        this.#clickerSimulation = clickerSimulation;
        this.#clickerSimulation.registerListener(this);
        this.#controller = controller;

        document.querySelector('#clickerSim')!.innerHTML = `
            <p id="totalClicks"> <b>Total clicks:</b> ${this.#clickerSimulation.totalClicks} </p>
            <p id="clickPower"> <b>Click power:</b> ${this.#clickerSimulation.clickPower} </p>
            <p id="autoCPS"> <b>Auto CPS:</b> ${this.#clickerSimulation.autoCPS} </p>
            <button type="button" id="clicker-button" style="cursor: pointer;">
                <img src="assets/Cursor.webp" height="256" width="256" alt="Cursor image"/>
            </button>`

        this.#totalClicks = document.querySelector("#totalClicks")!;
        this.#clickPower = document.querySelector("#clickPower")!;
        this.#autoCPS = document.querySelector("#autoCPS")!;

        document.querySelector("#clicker-button")!
            .addEventListener("click",
                () => { // update clicks by click amount
                    this.#controller.updateTotalClicks();
                })

        document.querySelector("#purchasablesSection")!.innerHTML =
            `<div id='clickerSimulation'>
                <p><b>Upgrades:</b></p>
                <button id="add-additive-upgrade1" style="cursor: pointer;">Additive Upgrade</button>
                <button id="add-multiplicative-upgrade1" style="cursor: pointer;">Multiplicative Upgrade</button>
                <p><b>Buildings:</b></p>
                <button id="add-additive-building1" style="cursor: pointer;">Additive Building</button>
                <button id="add-multiplicative-building1" style="cursor: pointer;">Multiplicative Building</button>
                <ul></ul>
            </div>`

        this.#dialog = document.createElement("dialog");
        this.#dialog.id = "purchase-dialog";

        this.#setUpAdditiveUpgrade();
        this.#setUpMultiplicativeUpgrade();
        this.#setUpAdditiveBuilding();
        this.#setUpMultiplicativeBuilding();
        this.notify();
    }

    #setUpAdditiveUpgrade(): void {
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
    }

    #setUpMultiplicativeUpgrade(): void {
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

    #setUpAdditiveBuilding(): void {
        document.querySelector("#add-additive-building1")!.addEventListener("mouseover", () => {
            if(!this.#dialog.open) {
                this.#controller.showBuildingDescription("additiveBuilding1");
            }
        });

        document.querySelector("#add-additive-building1")!.addEventListener("mouseout", () => {
            this.#controller.closeBuildingDescription();
        });

        document.querySelector("#add-additive-building1")!
            .addEventListener("click",
                () => {
                    try {
                        this.#controller.closeBuildingDescription();
                        this.#controller.applyBuilding("additiveBuilding1");
                        this.#displayPurchasedBuildingDialog();
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

    #setUpMultiplicativeBuilding(): void {
        document.querySelector("#add-multiplicative-building1")!.addEventListener("mouseover", () => {
            if(!this.#dialog.open) {
                this.#controller.showBuildingDescription("multiplicativeBuilding1");
            }
        });

        document.querySelector("#add-multiplicative-building1")!.addEventListener("mouseout", () => {
            this.#controller.closeBuildingDescription();
        });

        document.querySelector("#add-multiplicative-building1")!
            .addEventListener("click",
                () => {
                    try {
                        this.#controller.closeBuildingDescription();
                        this.#controller.applyBuilding("multiplicativeBuilding1");
                        this.#displayPurchasedBuildingDialog();
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

    #displayPurchasedBuildingDialog() {
        this.#dialog.innerHTML = `
        <button>X</button>
        <p>Purchased Building!</p>`

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#closeDialog())
    }

    #displayErrorDialog(missing: number) {
        this.#dialog.innerHTML = `
            <button>X</button>
            <p>Insufficient Clicks!</p>
            <p>You're missing ${missing} clicks</p>`

        document.body.appendChild(this.#dialog);
        this.#dialog.show();

        this.#dialog.querySelector("button")!
            .addEventListener("click", () => this.#closeDialog())
    }

    #closeDialog() {
        this.#dialog.close();
    }

    notify(): void {
        this.#totalClicks.innerHTML = `<b>Total clicks:</b> ${this.#clickerSimulation.totalClicks}`;
        this.#clickPower.innerHTML = `<b>Click power:</b> ${this.#clickerSimulation.clickPower}`;
        this.#autoCPS.innerHTML = `<b>Auto CPS:</b> ${this.#clickerSimulation.autoCPS}`;
    }
}