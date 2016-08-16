/**
 * Created by Thomas-P on 10.08.2016.
 */
export interface ITypeMeta {
    type: string;
    create<K>(): K;
    toJSON<K, U>(value:K ): U;
    fromJSON<K, U>(value: U): K;
}
