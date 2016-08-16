import {ModelMeta} from "../../../../src/model/meta/model";
import {Model} from "../../../../src/model/decorator/class.model";
import {KeyList} from "../../../../src/model/meta/key-list";
/**
 * Created by Thomas-P on 14.08.2016.
 */


describe('Class::ModelMeta(target)', () => {
    let meta: ModelMeta, child: ModelMeta;
    let TestClass;
    let ChildClass;
    /**
     * Set up a model to get the model information meta
     */
    beforeAll(() => {
        /**
         * Root class
         */
        @Model({
            collection: 'any',
        })
        class Test {
            constructor() {

            }
        }
        meta = ModelMeta.getMetaInformation(Test);
        TestClass = Test;
        /**
         * Child class
         */
        @Model({
            discriminator: 'Child',
        })
        class Child extends Test {

        }
        ChildClass = Child;
        child = ModelMeta.getMetaInformation(Child);
    });

    it('should have a correct interface', () => {
        expect(typeof meta.collection).toBe('string');
        expect(meta.collection).toBe('any');
        expect(meta.discriminator).toBeUndefined();
        expect(typeof meta.keys).toBe('object');
        expect(meta.keys instanceof KeyList).toBe(true);
        expect(meta.parent).toBeUndefined();
        expect(meta.root).toBe(meta);
        expect(meta.target).toBe(TestClass);
    });

    it('should have a correct child interface', () => {
        expect(typeof child.collection).toBe('string');
        expect(child.collection).toBe('any');
        expect(typeof child.discriminator).toBe('string');
        expect(child.discriminator).toBe('Child');

        expect(typeof child.keys).toBe('object');
        expect(child.keys instanceof KeyList).toBe(true);
        expect(child.parent).toBe(meta);
        expect(child.root).toBe(meta);
        expect(child.target).toBe(ChildClass);
    });

    describe('Methods::static methods', () => {
        it('should have a correct static interface', ()=> {
            expect(typeof ModelMeta.getMetaInformation).toBe('function');
            expect(typeof ModelMeta.hasMetaInformation).toBe('function');
        });

        it('should handle ModelMeta.getMetaInformation', () => {
            expect(() =>ModelMeta.getMetaInformation(undefined)).toThrowError();
            expect(() =>ModelMeta.getMetaInformation(undefined, true)).toThrowError();

            expect(ModelMeta.getMetaInformation(new TestClass)).toBe(meta);
            expect(ModelMeta.getMetaInformation(new ChildClass)).toBe(child);

            expect(ModelMeta.getMetaInformation({})).toBeUndefined();
            expect(ModelMeta.getMetaInformation({}, true)).toBeUndefined();
        });
    });
});