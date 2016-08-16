/**
 * Created by Thomas-P on 10.08.2016.
 */

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/createIndex
 */
export interface IIndex {
    name: string;
    keys: Array<string>;
    unique: boolean;
    /**
     * for multi
     */
    isArray: boolean;
}

/**
 * let iIndex: IIndex;
 *
 *
 * objectStore.createIndex(iIndex.name, iIndex.keys, {
 *      unique: iIndex.unique,
 *      multiEntry: iIndex.isArray,
 * });
 */