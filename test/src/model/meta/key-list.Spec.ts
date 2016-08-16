import {KeyList} from "../../../../src/model/meta/key-list";
import {Type, Types} from "../../../../src/model/decorator/property.type";
import {Default} from "../../../../src/model/decorator/property.default";
import {Model} from "../../../../src/model/decorator/class.model";
import {ModelMeta} from "../../../../src/model/meta/model";
import {IKeyMeta} from "../../../../src/model/interface/key";
import {Index} from "../../../../src/model/decorator/property.index";
/**
 * Created by Thomas-P on 15.08.2016.
 */


describe('Class::KeyList(()=>parent)', () => {
    let _Base, _Child1, _Child2, _Child3;
    /**
     * Set up three models
     */
    beforeEach(() => {
        @Model({
            collection: 'base'
        })
        class Base {
            @Type(Types.String)
            @Default('Hello World')
            @Index('test1', 'test2')
            property1: string;
        }
        @Model({
            discriminator: 'dis1'
        })
        class Child1 extends Base {
            @Index('test1', 'test3')
            @Type(Types.Number)
            property2: number;
        }
        @Model({
            discriminator: 'dis2'
        })
        class Child2 extends Base {
            @Type(Types.Boolean)
            property3: boolean;
        }
        @Model({
            discriminator: 'dis3'
        })
        class Child3 extends Child2 {
            @Type(Types.Boolean)
            @Default(true)
            property3: boolean;
        }

        _Base = Base;
        _Child1 = Child1;
        _Child2 = Child2;
        _Child3 = Child3;
    });

    it('should have a correct interface', () => {
        const key = new KeyList(() => null);

        expect(typeof key.getAllKeyNames).toBe('function');
        expect(typeof key.getAllKeys).toBe('function');
        expect(typeof key.getKey).toBe('function');
        expect(typeof key.setKey).toBe('function');

    });

    describe('Method::getKey(name, create)', () => {

        it('should get the correct key', () => {

            const metaBase= ModelMeta.getMetaInformation(_Base);
            const key1 = metaBase.keys.getKey('property1');
            expect(key1).toBeDefined();
            expect(key1.defaultValue).toBe('Hello World');
            expect(key1.keyType).toBe(Types.String);

            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const key2 = metaChild.keys.getKey('property2');
            expect(key2).toBeDefined();
            expect(key2.defaultValue).toBeUndefined();
            expect(key2.keyType).toBe(Types.Number);

            const key1a = metaChild.keys.getKey('property1');
            expect(key1a).toBeDefined();
            expect(key1a.defaultValue).toBe('Hello World');
            expect(key1a.keyType).toBe(Types.String);


            const metaChild2= ModelMeta.getMetaInformation(_Child2);
            const key3 = metaChild2.keys.getKey('property3');
            expect(key3).toBeDefined();
            expect(key3.defaultValue).toBeUndefined();
            expect(key3.keyType).toBe(Types.Boolean);

            const key1b = metaChild2.keys.getKey('property1');
            expect(key1b).toBeDefined();
            expect(key1b.defaultValue).toBe('Hello World');
            expect(key1b.keyType).toBe(Types.String);

            const key1c = metaChild2.keys.getKey('property1', true);
            expect(key1c).toBeDefined();
            expect(key1c.keyType).toBeUndefined();
        });

        it('should handle key override correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child3);
            const key2 = metaChild.keys.getKey('property3');
            expect(key2).toBeDefined();
            expect(key2.defaultValue).toBe(true);
            expect(key2.keyType).toBe(Types.Boolean);


            const keys = metaChild.keys.getAllKeys().filter((k) => k.keyName === 'property3');
            expect(keys.length).toBe(1);
            expect(keys[0]).toBe(key2);

        });
    });


    describe('Method::setKey(key)', () => {
        it('should work correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const key2 = metaChild.keys.getKey('property2');
            expect(key2).toBeDefined();
            expect(key2.defaultValue).toBeUndefined();
            expect(key2.keyType).toBe(Types.Number);


            const metaBase= ModelMeta.getMetaInformation(_Base);
            const key1 = metaBase.keys.getKey('property1');
            const key:IKeyMeta = {
                keyType: undefined,
                keyName: 'property1',
            };
            metaChild.keys.setKey(key);
            expect(metaChild.keys.getKey('property1')).toBe(key);


            const keyN:IKeyMeta = {
                keyType: Types.String,
                keyName: 'property2',
            };
            metaChild.keys.setKey(keyN);
            expect(metaChild.keys.getKey('property2')).toBe(keyN);
        });
    });


    describe('Method::getAllKeys()', () => {
        it('should work correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const keyArray = metaChild.keys.getAllKeys();
            expect(keyArray).toBeDefined();
            expect(Array.isArray(keyArray)).toBe(true);
            expect(keyArray.length).toBe(2);
            expect(keyArray.filter((p) => p.keyName === 'property1').length).toBe(1);
            expect(keyArray.filter((p) => p.keyName === 'property2').length).toBe(1);

        });
    });


    describe('Method::getAllKeyNames()', () => {
        it('should work correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const keyArray = metaChild.keys.getAllKeyNames();
            expect(keyArray).toBeDefined();
            expect(Array.isArray(keyArray)).toBe(true);
            expect(keyArray.length).toBe(2);
            expect(keyArray.filter((p) => p === 'property1').length).toBe(1);
            expect(keyArray.filter((p) => p === 'property2').length).toBe(1);
        });
    });

    describe('Method::getOwnIndexes()', () => {
        it('should work correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const indexes = metaChild.keys.getOwnIndexes();
            expect(indexes).toBeDefined();
            expect(Array.isArray(indexes)).toBe(true);
            expect(indexes.length).toBe(2);
            expect(indexes.filter((i) => i.indexName === 'test1').length).toBe(1, 'index: test1');
            expect(indexes.filter((i) => i.indexName === 'test3').length).toBe(1, 'index: test3');

        });

        it('should work correctly with no indices', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child2);
            const indexes = metaChild.keys.getOwnIndexes();
            expect(indexes).toBeDefined();
            expect(Array.isArray(indexes)).toBe(true);
            expect(indexes.length).toBe(0);
        });
    });

    describe('Method::getIndexes()', () => {
        it('should work correctly', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child1);
            const indexes = metaChild.keys.getIndexes();
            expect(indexes).toBeDefined();
            expect(Array.isArray(indexes)).toBe(true);
            expect(indexes.length).toBe(3);
            expect(indexes.filter((i) => i.indexName === 'test1').length).toBe(1, 'index: test1');
            expect(indexes.filter((i) => i.indexName === 'test2').length).toBe(1, 'index: test2');
            expect(indexes.filter((i) => i.indexName === 'test3').length).toBe(1, 'index: test3');
        });


        it('should work correctly with no indices', () => {
            const metaChild= ModelMeta.getMetaInformation(_Child2);
            const indexes = metaChild.keys.getIndexes();
            expect(indexes).toBeDefined();
            expect(Array.isArray(indexes)).toBe(true);
            expect(indexes.length).toBe(2);
            expect(indexes.filter((i) => i.indexName === 'test1').length).toBe(1, 'index: test1');
            expect(indexes.filter((i) => i.indexName === 'test2').length).toBe(1, 'index: test2');
        });
    });

});
