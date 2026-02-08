import Clickersimulation from "../model/clickersimulation.ts";
import Additiveupgrade from "../model/additiveupgrade.ts";
import ClickerSimulationView from "../view/clickersimulation-view.ts";
import Multiplicativeupgrade from "../model/multiplicativeupgrade.ts";
import UpgradeView from "../view/upgrade-view.ts";

export default class ClickerSimulationController {
    #clickersimulation: Clickersimulation;
    #clickerSimulationView: ClickerSimulationView;
    #upgradeView: UpgradeView;

    constructor() {
        this.#clickersimulation = new Clickersimulation();
        this.#clickerSimulationView = new ClickerSimulationView(this.#clickersimulation, this);

        let additiveUpgrade = new Additiveupgrade(
            "additiveUpgrade1", 10, 1);
        this.#clickersimulation.addUpgrade(additiveUpgrade);

        let multiplicativeUpgrade = new Multiplicativeupgrade(
            "multiplicativeUpgrade1", 20, 1.2);
        this.#clickersimulation.addUpgrade(multiplicativeUpgrade);

        this.#upgradeView = new UpgradeView(additiveUpgrade, this);
    }

    updateTotalClicks(): void {
        this.#clickersimulation.updateTotalClicks(this.#clickersimulation.clickPower);
        console.log("increased total clicks by " + this.#clickersimulation.clickPower);
    }

    applyUpgrade(id: string): void {
        const upgrade = this.#clickersimulation.getUpgradeById(id);
        this.#clickersimulation.applyUpgrade(upgrade);
    }

    showUpgradeDescription(id: string): void {
        const upgrade = this.#clickersimulation.getUpgradeById(id);
        this.#upgradeView.updateUpgradeDescription(upgrade);
    }

    closeUpgradeDescription(): void {
        this.#upgradeView.closeView();
    }
}