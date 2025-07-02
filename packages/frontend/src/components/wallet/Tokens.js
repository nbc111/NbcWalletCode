import React from 'react';
import styled from 'styled-components';

import FungibleTokens from '../../services/FungibleTokens';
import TokenBox from '../common/token/TokenBox';
import Skeleton from '../common/Skeleton';

const { getUniqueTokenIdentity } = FungibleTokens;

const StyledContainer = styled.div`
    width: 100%;

    @media (max-width: 991px) {
        margin-bottom: 50px;
    }

    .token-box {
        border-top: 1px solid #f0f0f1;

        :last-of-type {
            border-bottom: 1px solid #f0f0f1;
        }
    }
`;

const Tokens = ({ tokens, onClick, currentLanguage, showFiatPrice, isLoading = false }) => {
    // 如果正在加载且没有token数据，显示骨架屏
    if (isLoading && (!tokens || tokens.length === 0)) {
        return (
            <StyledContainer>
                {[1, 2, 3].map(i => (
                    <div key={i} className="token-box">
                        <Skeleton height="80px" width="100%" margin="0" />
                    </div>
                ))}
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            {tokens.map((token, i) => (
                <TokenBox
                    key={getUniqueTokenIdentity(token)}
                    token={token}
                    onClick={onClick}
                    currentLanguage={currentLanguage}
                    showFiatPrice={showFiatPrice}
                />
            ))}
        </StyledContainer>
    );
};

export default Tokens;
