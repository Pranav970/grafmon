import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AlertmanagerConfig, ConfigResult, ContainerStatus, DeployResult, HealthStatus, PrometheusConfig, RestartInput, ServiceLink } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDockerStatusUrl: () => string;
/**
 * Returns real-time status for every container in the monitoring stack
 * @summary Get all container statuses
 */
export declare const getDockerStatus: (options?: RequestInit) => Promise<ContainerStatus[]>;
export declare const getGetDockerStatusQueryKey: () => readonly ["/api/docker/status"];
export declare const getGetDockerStatusQueryOptions: <TData = Awaited<ReturnType<typeof getDockerStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDockerStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDockerStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDockerStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getDockerStatus>>>;
export type GetDockerStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get all container statuses
 */
export declare function useGetDockerStatus<TData = Awaited<ReturnType<typeof getDockerStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDockerStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getStartStackUrl: () => string;
/**
 * Runs docker compose up -d for the full stack
 * @summary Start the monitoring stack
 */
export declare const startStack: (options?: RequestInit) => Promise<DeployResult>;
export declare const getStartStackMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startStack>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startStack>>, TError, void, TContext>;
export type StartStackMutationResult = NonNullable<Awaited<ReturnType<typeof startStack>>>;
export type StartStackMutationError = ErrorType<unknown>;
/**
* @summary Start the monitoring stack
*/
export declare const useStartStack: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startStack>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startStack>>, TError, void, TContext>;
export declare const getStopStackUrl: () => string;
/**
 * Runs docker compose down for the full stack
 * @summary Stop the monitoring stack
 */
export declare const stopStack: (options?: RequestInit) => Promise<DeployResult>;
export declare const getStopStackMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof stopStack>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof stopStack>>, TError, void, TContext>;
export type StopStackMutationResult = NonNullable<Awaited<ReturnType<typeof stopStack>>>;
export type StopStackMutationError = ErrorType<unknown>;
/**
* @summary Stop the monitoring stack
*/
export declare const useStopStack: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof stopStack>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof stopStack>>, TError, void, TContext>;
export declare const getRestartServiceUrl: () => string;
/**
 * Runs docker compose restart [service?]
 * @summary Restart a specific service or the whole stack
 */
export declare const restartService: (restartInput: RestartInput, options?: RequestInit) => Promise<DeployResult>;
export declare const getRestartServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof restartService>>, TError, {
        data: BodyType<RestartInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof restartService>>, TError, {
    data: BodyType<RestartInput>;
}, TContext>;
export type RestartServiceMutationResult = NonNullable<Awaited<ReturnType<typeof restartService>>>;
export type RestartServiceMutationBody = BodyType<RestartInput>;
export type RestartServiceMutationError = ErrorType<unknown>;
/**
* @summary Restart a specific service or the whole stack
*/
export declare const useRestartService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof restartService>>, TError, {
        data: BodyType<RestartInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof restartService>>, TError, {
    data: BodyType<RestartInput>;
}, TContext>;
export declare const getGetServiceLinksUrl: () => string;
/**
 * Returns URLs for Grafana, Prometheus, Alertmanager, and the app
 * @summary Get quick-access links for all running services
 */
export declare const getServiceLinks: (options?: RequestInit) => Promise<ServiceLink[]>;
export declare const getGetServiceLinksQueryKey: () => readonly ["/api/services/links"];
export declare const getGetServiceLinksQueryOptions: <TData = Awaited<ReturnType<typeof getServiceLinks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getServiceLinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getServiceLinks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetServiceLinksQueryResult = NonNullable<Awaited<ReturnType<typeof getServiceLinks>>>;
export type GetServiceLinksQueryError = ErrorType<unknown>;
/**
 * @summary Get quick-access links for all running services
 */
export declare function useGetServiceLinks<TData = Awaited<ReturnType<typeof getServiceLinks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getServiceLinks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPrometheusConfigUrl: () => string;
/**
 * @summary Get current Prometheus configuration
 */
export declare const getPrometheusConfig: (options?: RequestInit) => Promise<PrometheusConfig>;
export declare const getGetPrometheusConfigQueryKey: () => readonly ["/api/config/prometheus"];
export declare const getGetPrometheusConfigQueryOptions: <TData = Awaited<ReturnType<typeof getPrometheusConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrometheusConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPrometheusConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPrometheusConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getPrometheusConfig>>>;
export type GetPrometheusConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get current Prometheus configuration
 */
export declare function useGetPrometheusConfig<TData = Awaited<ReturnType<typeof getPrometheusConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrometheusConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdatePrometheusConfigUrl: () => string;
/**
 * @summary Update Prometheus configuration
 */
export declare const updatePrometheusConfig: (prometheusConfig: PrometheusConfig, options?: RequestInit) => Promise<ConfigResult>;
export declare const getUpdatePrometheusConfigMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePrometheusConfig>>, TError, {
        data: BodyType<PrometheusConfig>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePrometheusConfig>>, TError, {
    data: BodyType<PrometheusConfig>;
}, TContext>;
export type UpdatePrometheusConfigMutationResult = NonNullable<Awaited<ReturnType<typeof updatePrometheusConfig>>>;
export type UpdatePrometheusConfigMutationBody = BodyType<PrometheusConfig>;
export type UpdatePrometheusConfigMutationError = ErrorType<unknown>;
/**
* @summary Update Prometheus configuration
*/
export declare const useUpdatePrometheusConfig: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePrometheusConfig>>, TError, {
        data: BodyType<PrometheusConfig>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePrometheusConfig>>, TError, {
    data: BodyType<PrometheusConfig>;
}, TContext>;
export declare const getGetAlertmanagerConfigUrl: () => string;
/**
 * @summary Get current Alertmanager configuration
 */
export declare const getAlertmanagerConfig: (options?: RequestInit) => Promise<AlertmanagerConfig>;
export declare const getGetAlertmanagerConfigQueryKey: () => readonly ["/api/config/alertmanager"];
export declare const getGetAlertmanagerConfigQueryOptions: <TData = Awaited<ReturnType<typeof getAlertmanagerConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlertmanagerConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAlertmanagerConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAlertmanagerConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getAlertmanagerConfig>>>;
export type GetAlertmanagerConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get current Alertmanager configuration
 */
export declare function useGetAlertmanagerConfig<TData = Awaited<ReturnType<typeof getAlertmanagerConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlertmanagerConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAlertmanagerConfigUrl: () => string;
/**
 * @summary Update Alertmanager configuration (rewrites the env section)
 */
export declare const updateAlertmanagerConfig: (alertmanagerConfig: AlertmanagerConfig, options?: RequestInit) => Promise<ConfigResult>;
export declare const getUpdateAlertmanagerConfigMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAlertmanagerConfig>>, TError, {
        data: BodyType<AlertmanagerConfig>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAlertmanagerConfig>>, TError, {
    data: BodyType<AlertmanagerConfig>;
}, TContext>;
export type UpdateAlertmanagerConfigMutationResult = NonNullable<Awaited<ReturnType<typeof updateAlertmanagerConfig>>>;
export type UpdateAlertmanagerConfigMutationBody = BodyType<AlertmanagerConfig>;
export type UpdateAlertmanagerConfigMutationError = ErrorType<unknown>;
/**
* @summary Update Alertmanager configuration (rewrites the env section)
*/
export declare const useUpdateAlertmanagerConfig: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAlertmanagerConfig>>, TError, {
        data: BodyType<AlertmanagerConfig>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAlertmanagerConfig>>, TError, {
    data: BodyType<AlertmanagerConfig>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
