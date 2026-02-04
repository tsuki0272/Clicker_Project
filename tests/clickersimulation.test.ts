import { expect, test } from 'vitest';
import Additiveupgrade from "../src/model/additiveupgrade";
import Clickersimulation from "../src/model/clickersimulation";

test('Can add additive upgrade', () => {
    let au = new Additiveupgrade("Adds 10 to current click amount");
    let cs = new Clickersimulation();

    cs.addUpgrade(au);

    expect(cs.upgrades).contains(au);
});

test("notify listeners", async () => {
    let au = new Additiveupgrade("Adds 10 to current click amount");
    let cs = new Clickersimulation();

    let notified = false;

    cs.registerListener({notify: () => notified = true});

    cs.addUpgrade(au);

    expect(notified).equals(true);
});