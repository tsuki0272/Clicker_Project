import { PGlite } from '@electric-sql/pglite';

const pgliteDb = await PGlite.create('idb://clicker_project');

export default function db() {
    return pgliteDb;
}