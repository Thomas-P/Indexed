import {Indexed} from "../../../src/database/indexed";
import {Model} from "../../../src/model/decorator/class.model";
import {Types, Type} from "../../../src/model/decorator/property.type";
import {Default} from "../../../src/model/decorator/property.default";
import {async} from "rxjs/scheduler/async";
/**
 * Created by Thomas-P on 15.08.2016.
 */
describe('Class::IndexedCollection(collection, discriminator, ()=>Promise<IDBDatabase>, ()=>IndexedModel)', ()=> {
    const indexed = new Indexed();
    indexed.setDB('testDatabase' + Math.random());
    let _Base, _Child;
    let _baseCalled = 0;
    let _childCalled = 0;

    beforeAll((done) => {

        @Model({
            collection: 'base',
        })
        class Base {
            @Type(Types.String)
            @Default('World')
            hello: string;

            @Type(Types.Number)
            prop1: number;

            constructor() {
                _baseCalled++;
            }
        }
        _Base = Base;


        @Model({
            discriminator: 'child'
        })
        class Child extends Base {
            @Default('Hello World')
            hello: string;

            constructor() {
                super();
                _childCalled++;
            }
        }
        _Child = Child;

        indexed
            .addModel(Base)
            .addModel(Child);
        done();
    });


    afterAll(() => {
        indexed.dropDatabase();


    });


    describe('Method::Insert(data)', () => {
        beforeEach(() => {
            _childCalled = 0;
            _baseCalled = 0;
        });

        it('should add a data for Child model', async (done) => {
            let collection =  indexed.model(_Child);
            let data;
            try {
                data = await collection.insert({
                    prop1: 42,
                });
                expect(data).toBeDefined();
                expect(data instanceof _Child).toBe(true);
                expect(data.prop1).toBeDefined();
                expect(typeof data.prop1).toBe('number');
                expect(data.prop1).toBe(42);
                expect(data.hello).toBeDefined();
                expect(typeof data.hello).toBe('string');
                expect(data.hello).toBe('Hello World');

                data = await collection.insert({
                    hello: null,
                    prop1: 42,
                });
                expect(data).toBeDefined();
                expect(data instanceof _Child).toBe(true);
                expect(data.prop1).toBeDefined();
                expect(typeof data.prop1).toBe('number');
                expect(data.prop1).toBe(42);
                expect(data.hello).toBeDefined();
                expect(typeof data.hello).toBe('object');
                expect(data.hello).toBe(null);
                done();
            } catch (e) {
                done.fail(e);
            }
        });

        it('should add data for Base model correctly', async (done) => {
            const collection = indexed.model(_Base);
            let data;
            try {
                data = await collection.insert({

                });
                expect(data).toBeDefined();
                expect(data instanceof _Base).toBe(true);

                done();
            } catch (e) {
                done.fail(e);
            }

        });

        it('should add data for Base model to Child collection', async (done) => {
            const collection = indexed.model(_Child);
            let data;
            try {
                data = await collection.insert(new _Base);
                expect(data).toBeDefined();
                expect(data instanceof _Base).toBe(true);
                done();
            } catch (e) {
                done.fail(e);
            }
        });

        it('should add data for Child model to Base collection', async (done) => {
            const collection = indexed.model(_Base);
            let data;
            try {
                data = await collection.insert(new _Child);
                expect(data).toBeDefined();
                expect(data instanceof _Base).toBe(true);
                done();
            } catch (e) {
                done.fail(e);
            }
        });

    });

    describe('Method::create()', () =>{

        it('should return a child object, when using with child collection', async (done) => {
            const child = await indexed.model(_Child).create();
            expect(child).toBeDefined();
            expect(child instanceof _Child).toBe(true);
            done();
        });

        it('should return a base object, when using with base collection', async (done) => {
            const base = await indexed.model(_Base).create();
            expect(base).toBeDefined();
            expect(base instanceof _Base).toBe(true);
            done();
        });

    });


    describe('Method::get(id)', () => {
        let base: Array<typeof _Base> = [];
        let child: Array<typeof _Child> = [];
        let baseCollection, childCollection;

        beforeAll(async (done) => {
            baseCollection = indexed.model(_Base);
            childCollection = indexed.model(_Child);
            const b1: typeof _Base = await baseCollection.create();
            b1.hello = 'what';
            const b2: typeof _Base = await baseCollection.create();
            b2.hello = 'expect';
            b2.prop1 = 12;

            base = [b1, b2].map((b) => baseCollection.insert(b));
            base = await Promise.all(base);

            const c1: typeof _Child = await childCollection.create();
            c1.hello = 'child what';
            const c2: typeof _Base = await childCollection.create();
            c2.prop1 = 23;

            child = [c1, c2].map((b) => childCollection.insert(b));
            child = await Promise.all(child);
            done();
        });

        it('should get base model', async (done) => {
            const ids= base
                .map((b) => baseCollection.idOf(b))
                .filter((id) => !!id);
            expect(ids.length).toBe(2);
            expect(ids.every((id) => typeof id === 'string')).toBe(true);
            try {
                const load = await Promise.all(
                    ids.map(
                        (id) => baseCollection.getItem(id)
                    )
                );
                expect(load).toEqual(base);
            } catch (e) {
                done.fail(e);
            }
            done();
        });

        it('should get child model', async (done) => {
            const ids= child
                .map((b) => childCollection.idOf(b))
                .filter((id) => !!id);
            expect(ids.length).toBe(2);
            expect(ids.every((id) => typeof id === 'string')).toBe(true);
            try {
                const load = await Promise.all(
                    ids.map(
                        (id) => childCollection.getItem(id)
                    )
                );
                expect(load).toEqual(child);
            } catch (e) {
                done.fail(e);
            }
            done();
        });

        it('should get child model from base collection', async (done) => {
            const ids= child
                .map((b) => baseCollection.idOf(b))
                .filter((id) => !!id);
            expect(ids.length).toBe(2);
            expect(ids.every((id) => typeof id === 'string')).toBe(true);
            try {
                const load = await Promise.all(
                    ids.map(
                        (id) => baseCollection.getItem(id)
                    )
                );
                expect(load).toEqual(child);
            } catch (e) {
                done.fail(e);
            }
            done();
        });

        it('should not get base model from child collection', async (done) => {
            const ids= base
                .map((b) => childCollection.idOf(b))
                .filter((id) => !!id);
            expect(ids.length).toBe(2);
            expect(ids.every((id) => typeof id === 'string')).toBe(true);
            try {
                const load = await Promise.all(
                    ids.map(
                        (id) => childCollection.getItem(id)
                    )
                );
                expect(load).toEqual(base);
            } catch (e) {
                done.fail(e);
            }
            done();
        });

    });
});
