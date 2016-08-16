/**
 * Created by Thomas-P on 08.08.2016.
 */
import {Model} from "../../../../src/model/index";
import {ModelMeta} from "../../../../src/model/index";
import {Type, Types} from "../../../../src/model/index";


/**
 * Check if a property also exists on an extended class
 */
describe('Decorator::Type(type)', () => {
    let classConstructor, classChild;

    const modelCollection = 'collectionModel' + Math.random();
    const modelIdentifier = 'identifierModel' + Math.random();

    beforeAll(() => {

        @Model({
            discriminator: modelIdentifier,
            collection: modelCollection,
        })
        class Test {
            @Type(Types.String)
            property1: string;
        }


        class Test2 extends Test{
            @Type(Types.Number)
            property2: number;
        }
        classConstructor = Test;
        classChild = Test2;
    });


    it('should have a Type for property1 (string)', () => {
        let meta = ModelMeta.getMetaInformation(classConstructor);
        expect(meta).toBeDefined('Class has meta information.');
        let property1 = meta.keys.getKey('property1');
        expect(property1).toBeDefined('Property 1 has meta information.');
        expect(property1.keyName).toBe('property1');
        expect(property1.keyType).toBeDefined();
        let keyType = property1.keyType;
        expect(keyType.type).toBe('string');


        meta = ModelMeta.getMetaInformation(classChild);
        expect(meta).toBeDefined('Class has meta information.');
        let propertyTest = meta.keys.getKey('property1');
        expect(propertyTest).toBeDefined();
        expect(propertyTest).toEqual(property1);

    });

    it('should have a Type for property2 (number)', () => {
        let meta = ModelMeta.getMetaInformation(classChild);
        expect(meta).toBeDefined('Class has meta information.');
        let property2 = meta.keys.getKey('property2');
        expect(property2).toBeDefined('Property 2 has meta information.');
        expect(property2.keyName).toBe('property2');
        expect(property2.keyType).toBeDefined();
        let keyType = property2.keyType;
        expect(keyType.type).toBe('number');

        meta = ModelMeta.getMetaInformation(classConstructor);
        expect(meta).toBeDefined('Class has meta information.');
        let propertyTest = meta.keys.getKey('property2');
        expect(propertyTest).toBeUndefined();

    });

});