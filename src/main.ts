import ClickerSimulationController from "./controller/clickersimulation-controller.ts";
import ddl from '../create-tables.sql?raw'
import db from './model/connection.ts'

//load tables into db
await db().exec(ddl);

// new AccountController();
new ClickerSimulationController();
