import ClickerSimulationController from "./controller/clickersimulation-controller.ts";
import ddl from '../create-tables.sql?raw'
import db from './model/connection.ts'
import AccountController from "./controller/account-controller.ts";

//load tables into db
db().exec(ddl);

// new AccountController();
new ClickerSimulationController();
