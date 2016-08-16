import {ModelMeta} from "../meta/model";
import {ITypeMeta} from "../interface/type";
/**
 * Created by Thomas-P on 07.08.2016.
 */


class StringType implements ITypeMeta {
    type: string = 'string';

    create(): string {
        return '';
    }

    toJSON(value: string): string {
        return value;
    }

    fromJSON(value: string): string {
        return value;
    }
}

class NumberType implements ITypeMeta {
    type: string = 'number';

    create(): number {
        return 0;
    }

    toJSON(value: number): string {
        return value && value.toString(10);
    }

    fromJSON(value: string): number {
        return Number(value);
    }
}

class BooleanType implements ITypeMeta {
    type: string = 'boolean';

    create(): boolean {
        return true;
    }

    toJSON(value: boolean): string {
        return value ? 'true' : 'false';
    }

    fromJSON(value: string): boolean {
        return value === 'true';
    }
}


class DateType implements ITypeMeta {
    type: string = 'date';

    create(): Date {
        return new Date();
    }

    toJSON(value: Date): string {
        return value && value.toJSON();
    }

    fromJSON(value: string): Date {
        return new Date(value);
    }
}


export const Types = {
    String: new StringType(),
    Number: new NumberType(),
    Boolean: new BooleanType(),
    Date: new DateType(),
    ObjectId: null,
};


export function Type<K, U>(information: ITypeMeta|string) {
    let result: ITypeMeta;
    if (typeof information === 'string') {
        switch (information.toLowerCase()) {
            case 'string':
                result = Types.String;
                break;
            case 'number':
                result = Types.Number;
                break;
            case 'boolean':
                result = Types.Boolean;
                break;
            case 'date':
                result = Types.Date;
                break;
            default:
                throw new Error(`Unknown type ${information}`);
        }

    } else {
        result = information;
    }
    return function (target, propertyKey: string) {
        let meta = ModelMeta.getMetaInformation(target, true);
        let info = meta.keys.getKey(propertyKey, true);
        info.keyType = result;
    }
}
