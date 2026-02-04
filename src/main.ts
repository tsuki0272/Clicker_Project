import ClickerSimulationController from "./controller/clickersimulation-controller.ts";

let clickerSimController = new ClickerSimulationController();

// we need to connect the button on the page with the
// method we want to invoke on the controller class.

document.querySelector("#add-additive-upgrade")!
.addEventListener("click",
    () => clickerSimController.addAdditiveUpgrade())