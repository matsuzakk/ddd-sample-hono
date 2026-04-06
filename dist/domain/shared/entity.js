/**
 * Aggregate / entity root base: identity is `id`.
 *
 * Each concrete entity should expose:
 * - `static create(...)` — new instances (enforce invariants)
 * - `static reconstitute(...)` — rebuild from persistence (skip “new” invariants)
 * and call `super(id)` from a non-public constructor.
 */
export class Entity {
    id;
    constructor(id) {
        this.id = id;
    }
    /** Same runtime class and same id. */
    sameIdentityAs(other) {
        return (other !== undefined &&
            other !== null &&
            this.constructor === other.constructor &&
            this.id === other.id);
    }
}
