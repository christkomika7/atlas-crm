"use client";
import { QueryResponse } from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export default function useQueryAction<T, K extends QueryResponse>(
    action: (data: T) => Promise<K>,
    successAction?: () => void,
    validateData?: string | string[],
    onActionSuccess?: (data: K) => void,
    hasMessage: boolean = true,
    onMutate?: (data: T) => Promise<unknown>,
    onError?: () => void,
    onOptimisticError?: (context: unknown) => void) {
    const queryClient = useQueryClient();

    const mutation = useMutation<K, Error, T, unknown>({
        mutationFn: action,

        // Optimistic update
        async onMutate(variables) {
            if (onMutate) {
                const context = await onMutate(variables);
                return context; // this will be passed to onError and onSettled
            }
            return undefined;
        },

        onSuccess: (data) => {
            if (hasMessage && data.message) {
                toast.success(data.message);
            }
            onActionSuccess?.(data);
            successAction?.();
        },

        onError: (error, _variables, context) => {
            if (onError) onError();
            if (hasMessage && error.message) {
                toast.error(error.message);
            }

            // rollback cache if provided
            if (onOptimisticError && context) {
                onOptimisticError(context);
            }
        },

        onSettled: (_data, _error, _variables, _context) => {
            if (validateData) {
                const keys = Array.isArray(validateData) ? validateData : [validateData];
                keys.forEach(key => {
                    queryClient.invalidateQueries({ queryKey: [key] });

                });
            }
        },
    });

    return {
        ...mutation
    };
}
