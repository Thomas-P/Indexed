import {ModelMeta} from "../model/index";
import {IModelMeta} from "../model/meta/model";
import {IModel} from "../interface/model";
import {ICollectionStore} from "../interface/collection-store";
import {IIndex} from "../interface/index";
/**
 * Created by Thomas-P on 08.08.2016.
 */

export class IndexedModel implements IModel {
    private collectionStore = new Map<string, ICollectionStore>();
    private addedModels = [];

    constructor(private isFrozen: () => boolean) {

    }

    private static getMeta(target): ModelMeta {
        let meta = ModelMeta.getMetaInformation(target);
        if (!meta) {
            throw new Error(`The model has no meta information`);
        }
        return meta;
    }

    private addCollection<U>(meta: IModelMeta) {
        if (!meta.collection) {
            throw new Error('meta is not set');
        }
        const collection:ICollectionStore = {
            collection: meta.collection,
            collectionTarget: meta.target,
            discriminator: new Map<string,U>(),
        };
        this.collectionStore.set(meta.collection, <ICollectionStore>collection);
    }

    private getCollectionStore(target):ICollectionStore {
        let meta = IndexedModel.getMeta(target);
        if (!meta) {
            throw new Error('Could not find meta data');
        }
        let collection = meta.collection;
        if (this.collectionStore.has(collection) === false) {
            this.addCollection(meta.root);
        }
        return this.collectionStore.get(collection);
    }

    /**
     *
     * @param target
     */
    addModel(target) {
        if (this.isFrozen()) {
            throw new Error(`Cannot add new models after database is opened.`);
        }
        const meta = IndexedModel.getMeta(target);
        if (this.addedModels.some((model) => model === meta.target)) {
            return;
        }
        let collectionStore = this.getCollectionStore(target);
        const isRoot = meta === meta.root;
        if (isRoot) {
            return;
        }
        if (!meta.discriminator) {
            throw new Error(`A model, that extend another model need a discriminator to distinguish from other.`);
        }
        if (collectionStore.discriminator.has(meta.discriminator)) {
            const checkTarget = collectionStore.discriminator.get(meta.discriminator);
            if (checkTarget !== target) {
                throw new Error('A model with the same discriminator is already present.');
            } else {
                return;
            }
        }
        collectionStore.discriminator.set(meta.discriminator, <any>meta.target);
    }

    getIndexes(collection): Array<IIndex> {
        return;
    }

    /**
     *
     * @param model
     */
    getKeys(model)
    /**
     *
     * @param collection
     * @param discriminator
     */
    getKeys(collection: string, discriminator?:string) {
        if(typeof collection !=='string') {
            const meta = ModelMeta.getMetaInformation(collection);
            collection = meta.collection;
            discriminator = meta.discriminator;
        }

    }


    /**
     *
     * @returns {Array<ICollectionStore>}
     */
    getCollectionData():Array<ICollectionStore> {
        const result: Array<ICollectionStore> = [];
        for (let value of this.collectionStore.values()) {
            result.push(value);
        }
        return result;
    }


    /**
     *
     * @param collection
     * @param discriminator
     */
    getModelData(collection: string|any, discriminator?: string): ModelMeta {
        if (typeof collection !=='string') {
            // return only stored models
            const meta= ModelMeta.getMetaInformation(collection);
            return this.getModelData(meta.collection, meta.discriminator);
        }
        const cStore = this.collectionStore.get(collection);
        if (!cStore) {
            throw new Error('Can not read collection info');
        }
        if (!discriminator) {
            return ModelMeta.getMetaInformation(cStore.collectionTarget);
        }
        const target = cStore.discriminator.get(discriminator);
        if (!target) {
            throw new Error('Can not read collection info');
        }
        return ModelMeta.getMetaInformation(target);
    }
}