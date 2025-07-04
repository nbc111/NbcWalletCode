import { useEffect, useRef } from 'react';

/**
 * 性能监控Hook
 * @param {string} componentName - 组件名称
 * @param {boolean} enabled - 是否启用监控
 */
export const usePerformanceMonitor = (componentName, enabled = true) => {
    const startTime = useRef(performance.now());
    const mounted = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const mountTime = performance.now() - startTime.current;
        console.log(`🚀 ${componentName} 挂载耗时: ${mountTime.toFixed(2)}ms`);

        // 记录首次内容绘制时间
        if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
                console.log(`🎨 ${componentName} 首次内容绘制: ${fcp.startTime.toFixed(2)}ms`);
            }
        }

        mounted.current = true;

        return () => {
            if (mounted.current) {
                const unmountTime = performance.now() - startTime.current;
                console.log(`🔚 ${componentName} 卸载耗时: ${unmountTime.toFixed(2)}ms`);
            }
        };
    }, [componentName, enabled]);

    return {
        getLoadTime: () => performance.now() - startTime.current
    };
};

/**
 * 网络请求监控Hook
 * @param {string} requestName - 请求名称
 */
export const useRequestMonitor = (requestName) => {
    const startTime = useRef(performance.now());

    const startRequest = () => {
        startTime.current = performance.now();
        console.log(`📡 ${requestName} 开始请求`);
    };

    const endRequest = () => {
        const duration = performance.now() - startTime.current;
        console.log(`✅ ${requestName} 请求完成: ${duration.toFixed(2)}ms`);
        return duration;
    };

    return { startRequest, endRequest };
}; 