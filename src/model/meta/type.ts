import {ITypeMeta} from "../interface/type";
/**
 * Created by Thomas-P on 07.08.2016.
 */

export class TypeMeta<K, U> implements ITypeMeta {
    type: string;

    create(): K {
        return undefined;
    }

    toJSON(value: K): U {
        return undefined;
    }

    fromJSON(value: U): K {
        return undefined;
    }

}