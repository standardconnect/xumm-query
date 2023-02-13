export type PayloadKey = readonly unknown[];

export type PayloadKeyHashFunction<TPayloadKey extends PayloadKey> = (
  queryKey: TPayloadKey
) => string;
