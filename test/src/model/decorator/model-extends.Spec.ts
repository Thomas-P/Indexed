import {Model} from "../../../../src/model/decorator/class.model";
import {ModelMeta} from "../../../../src/model/meta/model";
/**
 * Created by Thomas-P on 07.08.2016.
 */


describe('Decorator::Model(config)', () => {
    let noModel, isModel, root, isModelWithCollection;
    const modelCollection1 = 'collectionModel' + Math.random();
    const modelCollection3 = 'collectionModel' + Math.random();
    const modelIdentifier1 = 'identifierModel' + Math.random();
    const modelIdentifier2 = 'identifierModel' + Math.random();
    const modelIdentifier3 = 'identifierModel' + Math.random();

    beforeAll(() => {

        @Model({
            discriminator: modelIdentifier1,
            collection: modelCollection1,
        })
        class Root {

        }
        root = Root;


        class Test extends Root {

        }
        noModel = Test;


        @Model({
            discriminator: modelIdentifier2,
        })
        class Test2 extends Root {

        }

        isModel = Test2;

        @Model({
            collection: modelCollection3,
            discriminator: modelIdentifier3,
        })
        class Test3 extends Root {

        }

        isModelWithCollection = Test3;
    });
    it('should be a correct Root model', () => {
        const meta = ModelMeta.getMetaInformation(root);
        expect(meta).toBeDefined();
        expect(meta.collection).toBe(modelCollection1);
        expect(meta.discriminator).toBeUndefined();
    });


    it('should have no model if an extended class has no model', () => {
        const meta = ModelMeta.getMetaInformation(noModel);
        expect(meta).toBeUndefined();
    });


    it('should have an extended Model interface', () => {
        const meta = ModelMeta.getMetaInformation(isModel);
        expect(meta).toBeDefined();
        expect(meta.collection).toBe(modelCollection1);
        expect(meta.discriminator).toBe(modelIdentifier2);
    });


    it('should not have a new collection', () => {
        const meta = ModelMeta.getMetaInformation(isModelWithCollection);
        expect(meta).toBeDefined();
        expect(meta.collection).toBe(modelCollection1);
        expect(meta.discriminator).toBe(modelIdentifier3);
    });

});