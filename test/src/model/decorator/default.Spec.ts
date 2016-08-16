import {Model} from "../../../../src/model/decorator/class.model";
import {Default} from "../../../../src/model/decorator/property.default";
import {ModelMeta} from "../../../../src/model/meta/model";
/**
 * Created by Thomas-P on 14.08.2016.
 */


describe('Decorator::Default(value)', () => {
    let TestClass;
    let meta: ModelMeta;

    beforeAll(() => {
        @Model({
            collection: 'test',
        })
        class T {
            @Default('Hello World')
            property1: string;
            @Default(1)
            property2;
        }
        TestClass = T;
    });


    it('should have meta information', ()=> {
        meta = ModelMeta.getMetaInformation(TestClass);
        expect(meta).toBeDefined();
    });

    it('should have properties one and two', () => {
        expect(meta.keys.getKey('property1')).toBeDefined();
        expect(meta.keys.getKey('property2')).toBeDefined();

    })

});
