/**
 * Created by Thomas-P on 05.08.2016.
 */
import {ModelMeta} from "../model/meta/model";
import {IndexedModel} from "./indexed-model";
import {queryMapper} from "../query-engine/mapper";
import "reflect-metadata";
import {emit} from "cluster";
import {createId} from "../utils/id";

export enum QuerySort {
    Ascending = 1,
    Descending = -1
}

export interface IQuerySortOrder {
    [key: string]: QuerySort
}


export interface IQueryOptions {
    sort: IQuerySortOrder;
    select: Array<string>;
    limit: number;
    skip: number;
    populate: any;
}

const reflectionKey = 'reflectionKeyForCollection' + Math.random();

export class IndexedCollection {


    constructor(private collection: string,
                private discriminator: string,
                private openDatabase: ()=>Promise<IDBDatabase>,
                private _models: ()=>IndexedModel) {
        const modelData = _models();
        if (!modelData) {
            throw new Error(`Could not load model interface.`);
        }
        const meta = modelData.getModelData(collection, discriminator);
        if (!meta) {
            throw new Error(`Could not load meta data for collection ${collection} and the discriminator ${discriminator}`);
        }
    }

    /**
     *
     * @param obj
     * @returns {any}
     */
    private constructModel(obj) {
        obj = Object(obj);
        // @todo add references from old object
        const meta = this._models().getModelData(
            this.collection,
            obj.hasOwnProperty('_t') ? obj['_t'] : this.discriminator
        );
        if (!meta) {
            throw new Error('Unknown model');
        }
        const target = <Function>meta.target;
        const result = new target();
        meta.keys
            .getAllKeys()
            // @todo select filter
            .filter((key) => !! key)
            .forEach((key) => {
                const keyName = key.keyName;
                const type = key.keyType;
                if ( obj.hasOwnProperty(keyName)) {
                    result[keyName] = type ? type.fromJSON(obj[keyName]) : obj[keyName]
                } else {
                    result[keyName] = key.defaultValue;
                }
            });
        Reflect.defineMetadata(reflectionKey, {
            id: obj['_id'],
            _t: obj['_t'],
        }, result);
        return result;
    }


    private async openCollection(writeable?: boolean): Promise<IDBObjectStore> {
        const database = await this.openDatabase();
        if (database.objectStoreNames.contains(this.collection) === false) {
            throw new Error(`Collection ${this.collection} could not be found at database.`);
        }
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([this.collection], writeable ? 'readwrite' : 'readonly');
            transaction.addEventListener('error', reject);
            resolve(transaction.objectStore(this.collection));
        });
    }


    private async doMethod(write: boolean, methodName: string, ...params) {
        const collection = await this.openCollection(write);
        return new Promise((resolve, reject) => {
            const request = collection[methodName](...params);
            request.addEventListener('error', reject);
            request.addEventListener('success', (event) => resolve(event.target.result));
        });
    }


    list<K>(filter, options?): Promise<Array<K>> {
        if (this.discriminator) {
            filter = {
                $and: [{'_t': this.discriminator}, filter]
            }
        }
        const resultArray = [];
        const checkMethod = queryMapper(filter);
        return new Promise(async(resolve, reject) => {
            const collection = await this.openCollection();
            const successCallback = (event) => {
                const cursor:IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (checkMethod(cursor.value)) {
                        resultArray.push(cursor.value);
                        cursor.continue();
                    }
                } else {
                    resolve(resultArray);
                }
            };
            const request:IDBRequest = collection.openCursor();
            request.addEventListener('error', reject);
            request.addEventListener('success', successCallback);
        });
    }


    /**
     * Return a new Object, that get
     * @param data
     * @returns {any}
     */
    async insert<K, U>(data: K): Promise<U> {
        // @todo throw error if data has id
        // @todo get discriminator from meta data
        let meta: ModelMeta = ModelMeta.getMetaInformation(data);
        if (!meta) {
            meta = this._models().getModelData(this.collection, this.discriminator);
        }
        if (meta.collection !== this.collection) {
            return new IndexedCollection(
                meta.collection,
                meta.discriminator,
                this.openDatabase,
                this._models
            )
            .insert(data);
        }
        if (meta.discriminator) {
            data['_t'] = meta.discriminator;
        }
        data['_id'] = createId();
        await this.doMethod(true, 'add', data);
        return await this.get(data['_id']);
        // @todo add data transform
    }

    update<K, U>(data: K): Promise<U> {
        let meta = ModelMeta.getMetaInformation(data);
        if (!meta) {
            throw new Error(`Data has no model information`);
        }
        if (meta.collection !== this.collection) {
            return new IndexedCollection(meta.collection, meta.discriminator, this.openDatabase, this._models)
                .update(data);
        }
        return this.doMethod(true, 'put', data);
        // @todo add data transform
    }

    push<K, U>(data:K, keyName: string, childId:string)
    push<K, T, U>(data:K, keyName: string, child:T):U {
        return;
    }


    pull<K, U>(data:K, keyName: string, childId:string)
    pull<K, T, U>(data:K, keyName: string, child:T):U {
        return;
    }


    remove(id: any) {
        if (typeof id !=='string') {
            // @todo convert
        }
        return this.doMethod(true, 'delete', id);
        // @todo add data transform
    }


    async get<K>(id: string, options?: IQueryOptions): Promise<K> {
        // @todo check if the discriminator is valid
        const obj = await this.doMethod(true, 'get', id);
        return this.constructModel(obj);
    }
    //
    getItem = this.get;


    /**
     *
     * @param map
     * @param reduce
     * @param filter
     * @returns {Array}
     */
    async mapReduce<K, T, U>(map: (value: K, emit:(id: string, value: any) => any)=>any, reduce: (key, values: T) => U, filter): Promise<Array<U>> {
        // @todo make map async
        // https://docs.mongodb.com/manual/aggregation/#map-reduce
        let query = filter && filter.query || {};
        const list:Array<any> = await this.list(query);
        const mapStore = new Map<string, Array<T>>();
        const emit = (key: string, value: T) => {
            if (mapStore.has(key)) {
                const values = mapStore.get(key);
                values.push(value);
                return;
            }
            mapStore.set(key, [value]);

        };
        list.forEach((value) => map(value, emit));
        const resultArray = [];
        for (let [key, value] of mapStore.entries()) {
            const result = reduce.call(null, key, value);
            resultArray.push(result);
        }
        return resultArray;
    }

    idOf<T>(data: T): string {
        if (Reflect.hasMetadata(reflectionKey, data)) {
            const obj = Reflect.getOwnMetadata(reflectionKey, data);
            return obj.id;
        }
    }

    create() {
        return this.constructModel({});
    }

    private populate<K>(options: IQueryOptions, ...objects: Array<K>) {

        /*
         Story
         .find(...)
         .populate({
         path: 'fans',
         match: { age: { $gte: 21 }},
         select: 'name -_id',
         options: { limit: 5 }
         populate: { path: 'friends' }
         })
         .exec()
         */

    }
}