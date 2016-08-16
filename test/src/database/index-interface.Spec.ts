import {Indexed} from "../../../src/database/indexed";
import {Model} from "../../../src/model/decorator/class.model";
/**
 * Created by Thomas-P on 05.08.2016.
 */

describe('Class::Indexed()', function () {
    let indexed: Indexed;
    beforeAll(() => {
        indexed = new Indexed;
        indexed.setDB('testSet');

    });


    afterAll(() => {
        indexed.dropDatabase();
    });


    it('Check interface of Indexed class', function () {
        expect(indexed).toBeDefined();

        expect(typeof indexed.setDB === 'function').toBe(true);
        expect(typeof indexed.addModel === 'function').toBe(true);
        expect(typeof indexed.dropDatabase === 'function').toBe(true);
        expect(typeof indexed.isUpgraded === 'boolean').toBe(true);
        expect(typeof indexed.model === 'function').toBe(true);
        expect(typeof indexed.setVersion === 'function').toBe(true);

    });

    it('handle get model interface with unknown database', () => {
        let db = new Indexed();
        @Model({
            collection: '123'
        })
        class T {

        }
        db.addModel(T);
        expect(() => db.model(T)).toThrowError();
    });

    it('handle get model interface with unknown collection', () => {
        class T {

        }
        expect(() => indexed.model(T)).toThrowError();
        expect(() => indexed.model('test')).toThrowError();
        expect(() => indexed.model('test', '1')).toThrowError();
    });
});
