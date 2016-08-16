import {IKeyMeta} from "../interface/key";
import {ITypeMeta} from "../interface/type";
/**
 * Created by Thomas-P on 07.08.2016.
 */

export class KeyMeta<K> implements IKeyMeta {
    keyType: ITypeMeta;
    defaultValue: K;
    validation: Array<any>;
    isIndex: boolean;


    constructor(private _keyName: string) {
    }


    get keyName(): string {
        return this._keyName;
    }

}
