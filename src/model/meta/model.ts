/**
 * Created by Thomas-P on 07.08.2016.
 */
import "reflect-metadata";
import {getConstructorChain} from "../utils/get-constructor";
import {KeyList} from "./key-list";
import {ITarget} from "../interface/target";

const metaKey = 'ModelDataMeta';


export interface IModelMeta {
    collection: string;
    discriminator?: string;
    keys: KeyList;


    root: IModelMeta;
    parent: IModelMeta;
    target: any;
}

export class ModelMeta implements IModelMeta {
    private _collection: string;
    private _discriminator: string;
    /**
     * store the key list interface for the meta information object
     * @type {KeyList}
     * @private
     */
    private _keyList: KeyList = new KeyList(() => {
        let parent = this.parent;
        if (parent) {
            return parent._keyList;
        }
    });


    constructor(private _target: ITarget) {

    }


    /**
     * return the key list interface for this meta information object
     * @returns {KeyList}
     */
    get keys(): KeyList {
        return this._keyList;
    }


    /**
     * return a parent meta object, if anyone exists
     * @returns {ModelMeta}
     */
    get parent(): ModelMeta {
        let target:Array<any> = getConstructorChain(this._target);
        if (Array.isArray(target)) {
            let meta = target
                .map((target) => ModelMeta.getMetaInformation(target))
                .filter((t, index) => index>0 && !!t);
            return meta[0];
        }
    }


    /**
     * return the root meta object.
     * a root meta object stores the collection
     * @returns {ModelMeta}
     */
    get root(): ModelMeta {
        let target:Array<any> = getConstructorChain(this._target);
        if (Array.isArray(target) && target.length>0) {
            return ModelMeta.getMetaInformation(target[target.length-1], true);
        }
    }


    /**
     * return the own target
     * @returns {ITarget}
     */
    get target() {
        return this._target;
    }

    /**
     * returns the collection name for the target
     * @returns {string}
     */
    get collection(): string {
        //console.log(this._target, getConstructorChain(this._target));
        let root = this.root;
        return root._collection;
    }


    /**
     * stores a collection, to the root meta information object. If the object have already a collection
     * nothing will set
     * @param collection
     */
    set collection(collection: string) {
        if (!collection) {
            return;
        }
        let root = this.root;
        if (root._collection && root._collection !== collection) {
            return;
        }
        root._collection = collection;
    }


    /**
     * return the discriminator, if the model meta information object is not for the root object.
     * a root object has only the collection
     *
     * @returns {string}
     */
    get discriminator(): string {
        let root = this.root;
        if (root === this) {
            return;
        }
        return this._discriminator;
    }


    set discriminator(discriminator: string) {
        this._discriminator = discriminator;
    }


























    private static _getTargetConstructor(target) {
        if (!target) {
            throw new Error('Cannot find constructor on undefined.');
        }
        if (typeof target !== 'function' && typeof target.constructor==='function') {
            target = target.constructor;
        }
        if (target === Object) {
            return;
        }
        return target;
    }


    private static _createMetadata(target) {
        target = ModelMeta._getTargetConstructor(target);
        Reflect.defineMetadata(metaKey,new ModelMeta(target), target);
    }




    /**
     *
     * @param target
     * @param add
     * @returns {any}
     */
    static getMetaInformation(target, add = false): ModelMeta {
        target = ModelMeta._getTargetConstructor(target);
        if (!target) {
            return;
        }
        if (add && ModelMeta.hasMetaInformation(target) === false) {
            ModelMeta._createMetadata(target);
        }
        return Reflect.getOwnMetadata(metaKey, target);
    }



    static hasMetaInformation(target): boolean {
        target = ModelMeta._getTargetConstructor(target);
        return Reflect.hasOwnMetadata(metaKey, target);
    }
}