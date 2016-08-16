import {IKeyList} from "../interface/key-list";
import {IKeyMeta} from "../interface/key";
import {KeyMeta} from "./key";
import {IKeyIndex} from "../interface/key-index";
import {Indexed} from "../../database/indexed";

/**
 * Created by Thomas-P on 10.08.2016.
 */

const unique = <T>(arr: Array<T>):Array<T> => {
    return arr.reduce((p, c) => {
        if (p.indexOf(c) === -1) {
            p.push(c);
        }
        return p;
    }, []);
};

export class KeyList implements IKeyList {
    private _keys: Array<IKeyMeta> = [];

    constructor(private _parentList: () => KeyList) {

    }

    /**
     * return the key index for a property name
     * @param name
     * @returns {number}
     */
    getKeyIndex(name: string) {
        let len = this._keys.length;
        while (len--) {
            const value = this._keys[len];
            if (value.keyName === name) {
                return len;
            }
        }
        return -1;
    }

    static mixIndexes(...indexes:Array<IKeyIndex>) {
        const keyIndex = {};
        const result:Array<IKeyIndex> = [];
        indexes
            .filter((index) => index && Array.isArray(index.indexKeys))
            .forEach((index) => {
                if (keyIndex.hasOwnProperty(index.indexName)) {
                    result[keyIndex[index.indexName]].indexKeys.push(...index.indexKeys);
                } else {
                    keyIndex[index.indexName] = result.length;
                    result.push(index);
                }
            });
        result.forEach((index) => index.indexKeys = unique(index.indexKeys));
        return result;
    }

    getIndexes():Array<IKeyIndex> {
        const parent = this._parentList();
        if (parent) {
            return KeyList.mixIndexes(...parent.getIndexes(),...this.getOwnIndexes());
        }
        return this.getOwnIndexes();
    }


    getOwnIndexes():Array<IKeyIndex> {

        const keyMatrix = {};
        const keyIterator = (keyName: string) => {
            return (keyIndex: string) => {
                if (!keyMatrix[keyIndex] || !Array.isArray(keyMatrix[keyIndex])) {
                    keyMatrix[keyIndex] = [];
                }
                keyMatrix[keyIndex].push(keyName);
            }
        };
        this._keys.forEach((key) => {
            if (key.inIndex && Array.isArray(key.inIndex)) {
                key.inIndex.forEach(keyIterator(key.keyName));
            }
        });
        return Object
            .keys(keyMatrix)
            .map((indexName) => {
                const keyValue = keyMatrix[indexName];
                return {
                    indexName: indexName,
                    indexKeys: unique(keyValue)
                }
            });
    }


    /**
     *
     * @param name
     * @param create
     * @returns {any}
     */
    getKey(name: string, create = false): IKeyMeta {
        if (!name) {
            return;
        }
        const index = this.getKeyIndex(name);
        if (index > -1) {
            return this._keys[index];
        }

        if (create) {
            const meta = new KeyMeta(name);
            this.setKey(meta);
            return meta;
        }

        let parentList: KeyList = this._parentList();
        if (parentList) {
            return parentList.getKey(name);
        }
    }

    setKey(meta: IKeyMeta) {
        if (!meta) {
            return;
        }
        const index = this.getKeyIndex(meta.keyName);
        if (index === -1) {
            this._keys.push(meta);
        } else {
            this._keys[index] = meta;
        }
    }

    getAllKeys(): Array<IKeyMeta> {
        let parentKeys = [];
        const parentList = this._parentList();
        if (parentList) {
            parentKeys = parentList._keys;
        }
        const keys = this._keys.concat(parentKeys);
        return keys.reduce((p, c) => {
            if (p.some((meta: IKeyMeta) => meta.keyName === c.keyName) === false) {
                p.push(c);
            }
            return p;
        }, []);
    }


    getAllKeyNames(): Array<string> {
        return this.getAllKeys().map((meta) => meta.keyName);
    }
}