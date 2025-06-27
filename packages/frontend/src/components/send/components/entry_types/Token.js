import React from 'react';
import { Translate } from 'react-localize-redux';

import StyledContainer from './css/Style.css';
import TokenIcon from '../../../common/token/TokenIcon';

const Token = ({ symbol, icon, translateIdTitle, onClick }) => {
    /* TODO: Handle long Tokens */
    return (
        <StyledContainer className={onClick ? 'clickable' : ''} onClick={onClick}>
            {translateIdTitle && <Translate id={translateIdTitle} />}
            <div className='icon'>
                <span>
                    <TokenIcon symbol={symbol} icon={icon} />
                </span>
                {symbol?.toUpperCase().includes('NEAR') ? 'NBC' : symbol}
            </div>
        </StyledContainer>
    );
};

export default Token;
