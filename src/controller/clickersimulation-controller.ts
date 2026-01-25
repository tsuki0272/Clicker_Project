import Clickersimulation from "../model/clickersimulation.ts";
import Additiveupgrade from "../model/additiveupgrade.ts";
import ClickerSimulationView from "../view/clickersimulation-view.ts";

export default class ClickerSimulationController {
    #clickersimulation: Clickersimulation;
    #clickerSimulationView: ClickerSimulationView;

    constructor() {
        this.#clickersimulation = new Clickersimulation();
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation);
    }

    addAdditiveUpgrade(): void {
        let au = new Additiveupgrade("Increases CLICK POWER by an additive amount ");
        this.#clickersimulation.addUpgrade(au);

        console.log("Added Additive Upgrade to clicker simulation");
        console.log(this.#clickersimulation);
    }
}