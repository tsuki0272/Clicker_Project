export function assert(val: any, message: string) : asserts val {
    if(!val) {
        throw new AssertionError(message);
    }
}

/*
* AssertionError class creates Errors that indicate
* invalid states in domain model assertions
*/
class AssertionError extends Error {
    constructor(message: string) {
        super(message);
    }
}