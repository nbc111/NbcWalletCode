import { useState, useEffect } from 'react';

/**
 * 通用延迟加载Hook
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} enabled - 是否启用延迟加载
 * @returns {boolean} 是否应该开始加载
 */
export const useDelayedLoad = (delay = 1000, enabled = true) => {
    const [shouldLoad, setShouldLoad] = useState(!enabled);

    useEffect(() => {
        if (!enabled) {
            setShouldLoad(true);
            return;
        }

        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, enabled]);

    return shouldLoad;
};

/**
 * 条件延迟加载Hook - 只在满足条件时开始延迟加载
 * @param {boolean} condition - 触发条件
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {boolean} 是否应该开始加载
 */
export const useConditionalDelayedLoad = (condition, delay = 1000) => {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (!condition) {
            setShouldLoad(false);
            return;
        }

        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [condition, delay]);

    return shouldLoad;
}; 