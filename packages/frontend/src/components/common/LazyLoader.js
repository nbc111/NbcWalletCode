import React, { Suspense } from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    width: 100%;
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0072ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LazyLoader = ({ children, fallback }) => {
    return (
        <Suspense fallback={fallback || (
            <LoadingContainer>
                <LoadingSpinner />
            </LoadingContainer>
        )}>
            {children}
        </Suspense>
    );
};

export default LazyLoader; 