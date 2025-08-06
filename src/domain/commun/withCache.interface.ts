/**
 * Interface for classes that used cache mechanism needed to be refreshed after
 * some operations.
 */
interface WithCache {
  /**
   * Refresh the cache from the source data.
   */
  loadCache(): Promise<void>;
}
