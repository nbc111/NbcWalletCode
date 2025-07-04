import React, { useEffect, useState } from 'react';
import { Translate } from 'react-localize-redux';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import NFTBox from './NFTBox';
import FormButton from '../common/FormButton';
import NearCircleIcon from '../svg/NearCircleIcon.js';
import {
    selectLoadingOwnedToken,
    selectTokensWithMetadataForAccountId,
    actions as nftActions,
} from '../../redux/slices/nft';
import LoadingDots from '../common/loader/LoadingDots';

const StyledContainer = styled.div`
    &&& {
        width: 100%;

        @media (max-width: 991px) {
            margin-bottom: 50px;
        }

        .nft-box {
            border-top: 1px solid #f0f0f1;

            :first-of-type {
                border-top: none;
            }
        }

        .empty-state {
            display: flex;
            align-items: center;
            flex-direction: column;
            text-align: center;
            padding: 50px 20px;
            background-color: #f8f8f8;
            border-radius: 8px;

            @media (max-width: 991px) {
                margin-top: 15px;
            }

            @media (min-width: 992px) {
                margin: 15px 15px 50px 15px;
            }

            > div {
                color: #b4b4b4;
            }

            svg {
                margin-bottom: 30px;
            }

            button {
                width: 100%;
                margin: 25px auto 0 auto;
                border-color: #efefef;
                background: #efefef;
            }
        }

        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
            height: 20px;
            margin: 8px 0;
        }

        @keyframes loading {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }
    }
`;

const StyledLoadingContainer = styled.div`
    display: flex;
    align-items: center;
    height: 300px;
    max-height: 50vh;
`;

const NFTs = ({ accountId }) => {
    const dispatch = useDispatch();
    const [shouldLoadNFTs, setShouldLoadNFTs] = useState(false);
    
    const tokens = useSelector((state) =>
        selectTokensWithMetadataForAccountId(state, { accountId })
    );
    const isLoadingTokens = useSelector((state) =>
        selectLoadingOwnedToken(state, { accountId })
    );

    useEffect(() => {
        if (accountId) {
            // 立即开始加载NFT，但显示骨架屏
            setShouldLoadNFTs(true);
            dispatch(nftActions.fetchNFTs({ accountId }));
        }
    }, [accountId]);

    const ownedTokens = tokens.filter(
        (tokenDetails) =>
            tokenDetails.ownedTokensMetadata && tokenDetails.ownedTokensMetadata.length
    );

    // NFT骨架屏
    const NFTSkeleton = () => (
        <div>
            <div style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '4px',
                width: '40%', 
                height: '24px', 
                marginBottom: '20px' 
            }}></div>
            {[1, 2].map(i => (
                <div key={i} style={{ 
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'loading 1.5s infinite',
                    borderRadius: '8px',
                    width: '100%', 
                    height: '120px', 
                    marginBottom: '15px' 
                }}></div>
            ))}
        </div>
    );

    // 如果正在加载且没有数据，显示骨架屏
    if (isLoadingTokens && (!tokens || tokens.length === 0)) {
        return (
            <StyledContainer>
                <NFTSkeleton />
            </StyledContainer>
        );
    }

    if (ownedTokens.length) {
        return (
            <StyledContainer>
                {ownedTokens.map((tokenDetails) => (
                    <NFTBox key={tokenDetails.contractName} tokenDetails={tokenDetails} />
                ))}
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <div className='empty-state'>
                <NearCircleIcon />
                <div>
                    <Translate id='NFTs.emptyState' />
                </div>
                <FormButton
                    color='gray-blue'
                    linkTo='https://awesomenear.com/categories/nft/'
                >
                    <Translate id='exploreApps.exploreApps' />
                </FormButton>
            </div>
        </StyledContainer>
    );
};

export default NFTs;
