/**
 * Created by Thomas-P on 04.08.2016.
 */
import {IndexedModel} from "./indexed-model";
import {ICollectionStore} from "../interface/collection-store";
import {IndexedCollection} from "./indexed-collection";
import {ModelMeta} from "../model/meta/model";

export class Indexed {
    private _dbName: string;        // database name
    private _version: number;       // database version
    private _isUpgrade: boolean;    // database flag, if upgrade is done

    private _dbHook: IDBDatabase;   // opened database
    private _models: IndexedModel = new IndexedModel(() => !!this._dbHook);

    /**
     * set database name for indexed db
     * @param name
     */
    setDB(name: string) {
        this._dbName = name;
        this._dbHook = undefined;
        this._isUpgrade = false;
    }

    /**
     * set the version for the database
     * @param version
     */
    setVersion(version: number) {
        this._version = version;
        this._dbHook = undefined;
        this._isUpgrade = false;
    }


    /**
     * upgrade modelling handler
     * @param database
     */
    private upgradeModel(database: IDBDatabase) {
        const stores = {};
        this._models
            .getCollectionData()
            .forEach((collectionInfo: ICollectionStore) => {
                const collection = collectionInfo.collection;
                if (collection && database.objectStoreNames.contains(collection) === false) {
                    stores[collection] = database.createObjectStore(collection, {
                        keyPath: '_id',
                    });
                    const transaction: IDBTransaction = stores[collection].transaction;
                    transaction.addEventListener('complete', () => {
                        // transform action

                    });
                    // todo indexes
                }
            });
    }


    /**
     *
     * @returns {Observable<IDBDatabase>}
     */
    private openDatabase(): Promise<IDBDatabase> {
        if (this._dbHook) {
            return Promise.resolve(this._dbHook);
        }
        return new Promise((resolve, reject) => {
            const onSuccess = (event) => {
                let database: IDBDatabase = event.target.result;
                this._dbHook = database;
                resolve(database);

            };
            const onUpgrade = (event) => {
                let database = event.target.result;
                this._isUpgrade = true;
                this.upgradeModel(database);
            };
            let request: IDBRequest = indexedDB.open(
                this._dbName,
                this._version ? this._version : undefined
            );

            request.addEventListener('success', onSuccess);
            request.addEventListener('error', reject);
            request.addEventListener('upgradeneeded', onUpgrade);
        });
    }


    /**
     *
     * @param model
     * @returns {Indexed}
     */
    addModel<T>(model: T) {
        this._models.addModel(model);
        return this;
    }


    /**
     *
     * @returns {boolean}
     */
    get isUpgraded(): boolean {
        return !!this._isUpgrade;
    }


    /**
     * Return the collection interface for a specific model.
     * The model information will be acquired by the meta information of the target.
     * The model have to be registered before. Otherwise there will be an error.
     * @param target
     * @returns {IndexedCollection}
     */
    //model(target: any): IndexedCollection
    /**
     *  Return the collection interface for a specific model.
     *  The information for the collection interface will be get by the parameters.
     * The model have to be registered before. Otherwise there will be an error.
     * @param collection
     * @param discriminator
     * @returns {IndexedCollection}
     */
    model(collection: any, discriminator?: string): IndexedCollection {
        if (!this._dbName) {
            throw new Error('No database is specified.');
        }
        if (!collection) {
            throw new Error('No model or collection given.');
        }
        if (typeof collection !== 'string') {
            const meta = ModelMeta.getMetaInformation(collection);
            if (!meta) {
                throw new Error(`Cannot read meta information`);
            }
            return this.model(meta.collection, meta.discriminator);
        }
        const meta = this._models.getModelData(collection, discriminator);
        if (!meta) {
            throw new Error(`The model is not registered.`);
        }
        return new IndexedCollection(meta.collection, meta.discriminator, () => this.openDatabase(), () => this._models);
    }

    /**
     * Drop the actual set database
     */
    dropDatabase() {
        if (this._dbName) {
            indexedDB.deleteDatabase(this._dbName);
        }
    }

}