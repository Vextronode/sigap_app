import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

type ApiQueryConfig<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">;
};

export const useApiQuery = <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
  queryFn,
  options,
}: ApiQueryConfig<TQueryFnData, TError, TData, TQueryKey>) =>
  useQuery<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn,
    ...options,
  });
