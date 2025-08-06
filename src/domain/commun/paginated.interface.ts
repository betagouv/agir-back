/**
 * Interface to unify operations on paginated data collections.
 *
 * @template T - The type of items in the collection.
 */
interface Paginated<T> {
  countAll(): Promise<number>;
  listePaginated(skip: number, take: number): Promise<T[]>;
  listeAll(): Promise<T[]>;
}
