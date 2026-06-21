import { useQuery } from '@tanstack/react-query'
import { getCategories, getTags } from './api'

// Shared query keys so components that both need categories/tags (e.g. the
// homepage marquee and the shop page) hit the same cache instead of each
// fetching independently.
export function useCategories(slug) {
    return useQuery({
        queryKey: ['categories', slug],
        queryFn: () => getCategories(slug),
        enabled: Boolean(slug),
        select: (data) => data.categories || [],
    })
}

export function useTags(slug) {
    return useQuery({
        queryKey: ['tags', slug],
        queryFn: () => getTags(slug),
        enabled: Boolean(slug),
        select: (data) => data.tags || [],
    })
}
