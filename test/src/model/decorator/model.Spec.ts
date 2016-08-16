import {Model} from "../../../../src/model/index";
import {ModelMeta} from "../../../../src/model/index";
/**
 * Created by Thomas-P on 07.08.2016.
 */


describe('Decorator::Model(config)', () => {
    let classConstructor;
    const modelCollection = 'collectionModel' + Math.random();
    const modelIdentifier = 'identifierModel' + Math.random();

    beforeAll(() => {

        @Model({
            discriminator: modelIdentifier,
            collection: modelCollection,
        })
        class Test {

        }

        classConstructor = Test;
    });


    it('should have a Model interface', () => {
        let meta = ModelMeta.getMetaInformation(classConstructor);
        expect(meta).toBeDefined();
        expect(meta.collection).toBe(modelCollection);
        // the core class did not have a discriminator
        expect(meta.discriminator).toBeUndefined();
    });

});