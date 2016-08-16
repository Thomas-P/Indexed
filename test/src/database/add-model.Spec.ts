import {Indexed} from "../../../src/database/indexed";
import {Model} from "../../../src/model/decorator/class.model";
import {ModelMeta} from "../../../src/model/meta/model";
import {async} from "rxjs/scheduler/async";
/**
 * Created by Thomas-P on 08.08.2016.
 */

describe('Database::Collection::Insert', () => {
    let classConstructor;
    const database = new Indexed();

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
        database.setDB('indexed-test');
        database.dropDatabase();
        database.addModel(Test);
    });

    afterAll(() => {
        database.dropDatabase();
    });


    it('Insert an object to the database', (done) => {
        var collection = database
            .model(classConstructor);
        collection
            .insert(new classConstructor())
            .then((obj) => {
                expect(obj instanceof classConstructor).toBe(true);
                expect(ModelMeta.getMetaInformation(classConstructor)).toBe(ModelMeta.getMetaInformation(obj));
                done();
            })
            .catch((e: Error) => {
                done.fail(e);
            });
    });

});