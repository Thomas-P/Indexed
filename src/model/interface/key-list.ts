import {IKeyMeta} from "./key";
/**
 * Created by Thomas-P on 10.08.2016.
 */

export interface IKeyList {
    /**
     * return the index position for a key on the same list object
     * if the key is not present, than -1 will be returned
     * @param name
     */
    getKeyIndex(name: string): number;
    /**
     * return a key object if the key is found
     * @param name
     */
    getKey(name: string): IKeyMeta;
    /**
     * return a key object. If the key is not found and create is set to true,
     * than the key object will be created and returned.
     * @param name
     * @param create
     */
    getKey(name: string, create: boolean): IKeyMeta;
    /**
     * set a key or replace it by meta information
     * @param meta
     */
    setKey(meta: IKeyMeta);
    /**
     * return a list of all keys, set in the key list.
     * also the parent keys will be returned, if the key is not present at the
     * own list
     */
    getAllKeys(): Array<IKeyMeta>;
    /**
     * Return all key names, also from parent
     * @returns {string[]}
     */
    getAllKeyNames(): Array<string>;

}
