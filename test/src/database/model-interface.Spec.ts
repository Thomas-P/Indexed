import {IndexedModel} from "../../../src/database/indexed-model";
import {Model} from "../../../src/model/decorator/class.model";
import {ModelMeta} from "../../../src/model/meta/model";
/**
 * Created by Thomas-P on 15.08.2016.
 */


describe('Class::IndexedModel(() => boolean)', ()=> {


    it('should have a correct interface', () => {
        const model = new IndexedModel(() => false);
        expect(model).toBeDefined();
        expect(typeof model.addModel).toBe('function');
        expect(typeof model.getCollectionData).toBe('function');
        expect(typeof model.getIndexes).toBe('function');
        expect(typeof model.getKeys).toBe('function');
        expect(typeof model.getModelData).toBe('function');
    });

    describe('Method::addModel(Model)', () => {
        it('should add new model and sub model', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'c'
            })
            class T {

            }
            model.addModel(T);
            const meta = ModelMeta.getMetaInformation(T);
            expect(model.getModelData(meta.collection, meta.discriminator)).toBe(meta);
            // sub model
            @Model({
                discriminator: 'a'
            })
            class U extends T {

            }
            model.addModel(U);
            const meta2 = ModelMeta.getMetaInformation(U);
            expect(model.getModelData(meta2.collection, meta2.discriminator)).toBe(meta2);
        });

        it('throws an error, when model is frozen', () => {
            let isFrozen = false;
            const model = new IndexedModel(() => isFrozen);
            @Model({
                collection: 'A',
            })
            class U {

            }
            isFrozen = true;
            expect(() => model.addModel(U)).toThrowError();
        });

        it('handle model has no meta data failure', () => {
            const model = new IndexedModel(() => false);
            class T {

            }
            expect(() => model.addModel(T)).toThrowError();
        });

        it('handle model has no collection failure', () => {
            const model = new IndexedModel(() => false);
            @Model({

            })
            class T {

            }
            expect(() => model.addModel(T)).toThrowError();
        });

        it('should handle same discriminator failure', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }

            @Model({
                discriminator: 's',
            })
            class S extends T {

            }

            @Model({
                discriminator: 's',
            })
            class U extends T {

            }


            model.addModel(S);
            expect(() => model.addModel(U)).toThrowError();

        });



        it('should handle missing discriminator failure', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }


            @Model({
            })
            class U extends T {

            }


            expect(() => model.addModel(U)).toThrowError();

        });

        it('should work correct if add model twice', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }
            model.addModel(T);
            model.addModel(T);
            expect(model.getModelData(T)).toBe(ModelMeta.getMetaInformation(T));
        });

        it('should work correct if add an extended model twice', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }


            @Model({
                discriminator: 's'
            })
            class U extends T {

            }


            model.addModel(U);
            model.addModel(U);
            expect(model.getModelData(U)).toBe(ModelMeta.getMetaInformation(U));

        });
    });

    describe('Method::getCollectionData()', () => {
        it('should return collection data', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }


            @Model({
                discriminator: 's'
            })
            class U extends T {

            }


            model.addModel(U);

            const modelData = model.getCollectionData();
            expect(modelData).toBeDefined();
            expect(Array.isArray(modelData)).toBe(true);
            expect(modelData.length).toBe(1);
            const collectionData = modelData[0];
            expect(collectionData).toBeDefined();
            expect(collectionData.collection).toBe('base');
            expect(collectionData.collectionTarget).toBe(T);
            expect(collectionData.discriminator).toBeDefined();
            expect(collectionData.discriminator.get('s')).toBe(U);
            expect(collectionData.discriminator.size).toBe(1);


        });
    });


    describe('Method::getModelData(target)', () => {

        it('should get data by model', ()=> {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }


            @Model({
                discriminator: 's'
            })
            class U extends T {

            }


            model.addModel(U);

            const meta = model.getModelData(T);
            expect(meta).toBe(ModelMeta.getMetaInformation(T));
            const metaU = model.getModelData(U);
            expect(metaU).toBe(ModelMeta.getMetaInformation(U));

            const metaT = model.getModelData(meta.collection, meta.discriminator);
            expect(metaT).toBe(meta);

            const metaU2 = model.getModelData(metaU.collection, metaU.discriminator);
            expect(metaU2).toBe(metaU);

        });

        it('should handle no model of store correct', () => {
            const model = new IndexedModel(() => false);
            @Model({
                collection: 'base',
            })
            class T {

            }


            @Model({
                discriminator: 's'
            })
            class U extends T {

            }


            model.addModel(T);
            const meta = ModelMeta.getMetaInformation(T);
            expect(() => model.getModelData(U)).toThrow();
            expect(() => model.getModelData(meta.collection, 'what')).toThrow();
        });
    });


    describe('Method::getOwnIndexes(collection)', () => {
        // @todo

    });


    describe('Method::getKeys(target)', () => {
        // @todo

    });
});
