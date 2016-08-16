import {ITypeMeta} from "./type";
/**
 * Created by Thomas-P on 10.08.2016.
 */
export interface IKeyMeta {
    keyName: string;
    keyType: ITypeMeta;
    defaultValue?: any;
    validation?: Array<any>;
    hasIndex?: boolean;
    inIndex?: Array<string>;

}
